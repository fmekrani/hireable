import { SKILL_DICTIONARY } from "./skillDictionary";

export type ResumeParsed = {
  skills: string[];
  yearsExperience: number;
  seniority: "Entry" | "Mid" | "Senior" | "Principal";
  domain?: "Frontend" | "Backend" | "Full-Stack" | "DevOps" | "Data";
  education?: "Bootcamp" | "Bachelor" | "Master" | "PhD";
  meta?: {
    extractedWith: "pdfplumber";
    rawTextLength: number;
    confidence?: {
      skills: number;
      yearsExperience: number;
      seniority: number;
      domain?: number;
      education?: number;
    };
    warnings?: string[];
    debug?: {
      detectedSections: string[];
      experienceRanges?: string[];
      matchedSkillTokens?: string[];
    };
  };
};

export type Extraction = {
  rawText: string;
  pages: string[];
  error?: string | null;
};

// -------------------- Normalization --------------------
function normalizeText(raw: string, pages?: string[]) {
  const standardize = (s: string) => {
    return s
      .replace(/\r\n|\r/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ \u00A0]{2,}/g, " ")
      .replace(/-\s*\n\s*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const text = standardize(raw || "");
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  // Optional: remove repeated short lines that look like headers/footers using pages
  if (pages && pages.length > 1) {
    const freq: Record<string, number> = {};
    const pageLines = pages.map((p) => standardize(p).split("\n").map((l) => l.trim()).filter(Boolean));
    for (const pl of pageLines) {
      const seen = new Set<string>();
      for (const l of pl) {
        if (l.length <= 40) {
          if (!seen.has(l)) {
            freq[l] = (freq[l] || 0) + 1;
            seen.add(l);
          }
        }
      }
    }
    const threshold = Math.max(1, Math.floor(pages.length / 2));
    const noise = new Set(Object.entries(freq).filter(([_, v]) => v >= threshold).map(([k]) => k));
    const filtered = lines.filter((l) => !noise.has(l));
    return { text: filtered.join("\n"), lines: filtered };
  }

  return { text, lines };
}

// -------------------- Section Detection --------------------
const SKILLS_HEADINGS = ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "TECHNOLOGIES"];
const EXPERIENCE_HEADINGS = ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT"];
const EDUCATION_HEADINGS = ["EDUCATION", "ACADEMIC BACKGROUND"];

function isHeading(line: string): boolean {
  const s = line.trim();
  const upperRatio = s.replace(/[^A-Z]/g, "").length / Math.max(1, s.replace(/[^A-Za-z]/g, "").length);
  const hasColon = /:\s*$/.test(s) || /—\s*$/.test(s);
  const keywords = [...SKILLS_HEADINGS, ...EXPERIENCE_HEADINGS, ...EDUCATION_HEADINGS];
  const keywordMatch = keywords.some((h) => s.toUpperCase().includes(h));
  return keywordMatch && (upperRatio > 0.5 || hasColon);
}

function detectSections(lines: string[]) {
  type SectionKey = "skills" | "experience" | "education";
  const detectedHeadings: string[] = [];
  const buckets: Record<SectionKey, string[]> = { skills: [], experience: [], education: [] };
  let current: SectionKey | null = null;

  const matchHeading = (s: string): SectionKey | null => {
    const up = s.toUpperCase();
    if (SKILLS_HEADINGS.some((h) => up.includes(h))) return "skills";
    if (EXPERIENCE_HEADINGS.some((h) => up.includes(h))) return "experience";
    if (EDUCATION_HEADINGS.some((h) => up.includes(h))) return "education";
    return null;
  };

  for (const line of lines) {
    if (isHeading(line)) {
      const sec = matchHeading(line);
      if (sec) {
        detectedHeadings.push(line);
        current = sec;
        continue;
      }
    }
    if (current) buckets[current].push(line);
  }

  return { skillsLines: buckets.skills, experienceLines: buckets.experience, educationLines: buckets.education, detectedHeadings };
}

// -------------------- Skills Extraction --------------------
function buildBoundaryRegex(token: string): RegExp {
  // Careful handling for short tokens like Go, R
  if (/^Go$/i.test(token)) {
    return new RegExp(String.raw`(?<!Goo)\bGo\b`, "i"); // avoids Google/Googler
  }
  if (/^R$/i.test(token)) {
    return new RegExp(String.raw`(?:^|[\s,;\(\)\[\]])R(?:$|[\s,;\+\)\]\./])`, "i");
  }
  // Default: word boundary around token
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(String.raw`\b${escaped}\b`, "i");
}

function extractSkills(input: { skillsLines: string[]; text: string }) {
  const { skillsLines, text } = input;
  const haystack = (skillsLines.length ? skillsLines.join("\n") : text) || "";
  const matched: Set<string> = new Set();
  const matchedTokens: string[] = [];

  for (const [canon, aliases] of Object.entries(SKILL_DICTIONARY)) {
    for (const alias of aliases) {
      const re = buildBoundaryRegex(alias);
      if (re.test(haystack)) {
        matched.add(canon);
        matchedTokens.push(alias);
        break;
      }
    }
  }

  const skills = Array.from(matched).sort((a, b) => a.localeCompare(b));
  const density = skillsLines.length ? Math.min(1, skills.length / Math.max(5, skillsLines.length)) : Math.min(1, skills.length / 10);
  const confidence = Math.max(0.2, Math.min(1, (skillsLines.length ? 0.4 : 0.2) + Math.min(0.6, skills.length * 0.05) + density * 0.4));
  return { skills, matchedSkillTokens: matchedTokens, confidence };
}

// -------------------- Years of Experience --------------------
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

function parseMonthToken(tok: string): number | null {
  const t = tok.toLowerCase();
  const i = MONTHS.findIndex((m) => t.startsWith(m));
  return i >= 0 ? i : null;
}

function parseExplicitYears(text: string): number | null {
  const patterns = [
    /([0-9]+(?:\.[0-9]+)?)\s*(?:\+)?\s*years?\s+of\s+experience/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:\+)?\s*years?(?!\s*old)/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return Math.round(parseFloat(m[1]));
  }
  return null;
}

function monthsBetween(a: Date, b: Date): number {
  const start = new Date(Math.min(a.getTime(), b.getTime()));
  const end = new Date(Math.max(a.getTime(), b.getTime()));
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() - start.getDate() >= 15) months += 1; // rough half-month rounding
  return Math.max(0, months);
}

function parseDateRanges(text: string): { ranges: [Date, Date][]; pretty: string[] } {
  const now = new Date();
  const pretty: string[] = [];
  const ranges: [Date, Date][] = [];

  const patterns = [
    // 2021 - 2023
    /\b(\d{4})\s*[–\-]\s*(\d{4}|Present|Current)\b/gi,
    // Jan 2021 - Present
    /\b([A-Za-z]{3,9})\s*(\d{4})\s*[–\-]\s*([A-Za-z]{3,9}|\d{4}|Present|Current)\s*(\d{4})?\b/gi,
    // 01/2020 – 06/2022
    /\b(\d{1,2})\/(\d{4})\s*[–\-]\s*(\d{1,2})\/(\d{4}|Present|Current)\b/gi,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      try {
        if (m.length === 3) {
          const y1 = parseInt(m[1], 10);
          const endToken = m[2];
          const endYear = /Present|Current/i.test(endToken) ? now.getFullYear() : parseInt(endToken, 10);
          const a = new Date(y1, 0, 1);
          const b = new Date(endYear, 0, 1);
          ranges.push([a, b]);
          pretty.push(`${y1} - ${endToken}`);
        } else if (m.length >= 5 && /[A-Za-z]/.test(m[1])) {
          const m1 = parseMonthToken(m[1]) ?? 0;
          const y1 = parseInt(m[2], 10);
          const endTok = m[3];
          const y2 = m[4] ? parseInt(m[4], 10) : now.getFullYear();
          const m2 = /Present|Current/i.test(endTok) ? now.getMonth() : (parseMonthToken(endTok) ?? 0);
          const a = new Date(y1, m1, 1);
          const b = new Date(y2, m2, 1);
          ranges.push([a, b]);
          pretty.push(`${m[1]} ${y1} - ${endTok}${m[4] ? " " + m[4] : ""}`);
        } else if (m.length === 5) {
          const m1 = Math.max(0, Math.min(11, parseInt(m[1], 10) - 1));
          const y1 = parseInt(m[2], 10);
          const endMonthTok = m[3];
          const endYearTok = m[4];
          const m2 = Math.max(0, Math.min(11, parseInt(endMonthTok, 10) - 1));
          const y2 = /Present|Current/i.test(endYearTok) ? now.getFullYear() : parseInt(endYearTok, 10);
          const a = new Date(y1, m1, 1);
          const b = new Date(y2, m2, 1);
          ranges.push([a, b]);
          pretty.push(`${m[1]}/${y1} - ${endMonthTok}/${endYearTok}`);
        }
      } catch {}
    }
  }
  return { ranges, pretty };
}

function unionMonths(ranges: [Date, Date][]): number {
  if (ranges.length === 0) return 0;
  // Convert to month indices from epoch for easier union
  const toIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();
  const segs = ranges.map(([a, b]) => [toIndex(a), toIndex(b)] as [number, number]).sort((x, y) => x[0] - y[0]);
  let total = 0;
  let [curStart, curEnd] = segs[0];
  for (let i = 1; i < segs.length; i++) {
    const [s, e] = segs[i];
    if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      total += Math.max(0, curEnd - curStart);
      curStart = s;
      curEnd = e;
    }
  }
  total += Math.max(0, curEnd - curStart);
  return total;
}

function estimateYearsExperience({ experienceLines, text }: { experienceLines: string[]; text: string }) {
  const hay = (experienceLines.length ? experienceLines.join("\n") : text);
  const explicit = parseExplicitYears(hay);
  let years = 0;
  let rangesPretty: string[] = [];
  if (explicit !== null) {
    years = explicit;
  } else {
    const { ranges, pretty } = parseDateRanges(hay);
    rangesPretty = pretty;
    const totalMonths = unionMonths(ranges);
    years = Math.round(totalMonths / 12);
    if (years === 0) {
      // fallback heuristic
      const hasIntern = /\bintern(ship)?\b/i.test(hay);
      const hasProjects = /\bproject(s)?\b/i.test(hay);
      years = hasIntern || hasProjects ? 1 : 0;
    }
  }
  years = Math.max(0, Math.min(40, years));
  const confidence = Math.min(1, explicit !== null ? 0.9 : (rangesPretty.length ? 0.7 : 0.4));
  return { yearsExperience: years, confidence, rangesPretty };
}

// -------------------- Seniority --------------------
function inferSeniority(years: number, text: string, experienceLines: string[]) {
  let base: ResumeParsed["seniority"] = years <= 1 ? "Entry" : years <= 4 ? "Mid" : years <= 8 ? "Senior" : "Principal";
  const hay = (experienceLines.length ? experienceLines.join("\n") : text);
  if (/\b(Principal|Staff|Lead|Architect)\b/i.test(hay)) base = "Principal";
  else if (/\bSenior\b/i.test(hay)) base = "Senior";
  else if (/\bintern\b/i.test(hay) && years <= 2) base = "Entry";
  const confidence = Math.min(1, 0.6 + Math.min(0.4, years * 0.05));
  return { seniority: base, confidence };
}

// -------------------- Domain --------------------
const DOMAIN_BUCKETS: Record<Exclude<NonNullable<ResumeParsed["domain"]>, "Full-Stack">, string[]> = {
  Frontend: ["React", "Next.js", "Vue", "Angular", "Svelte", "CSS", "HTML", "Tailwind", "Redux", "Webpack"],
  Backend: ["Node.js", "Express", "Python", "Django", "Flask", "FastAPI", "Java", "Spring", "C#", ".NET", "Go", "Rust", "PHP", "Ruby", "GraphQL", "Kafka", "RabbitMQ"],
  DevOps: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions"],
  Data: ["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Spark", "Hadoop", "Airflow", "SQL", "PostgreSQL", "MySQL", "SQL Server"],
};

function inferDomain(skills: string[]) {
  const scores: Record<string, number> = {};
  for (const [bucket, items] of Object.entries(DOMAIN_BUCKETS)) {
    scores[bucket] = items.reduce((acc, it) => acc + (skills.includes(it) ? 1 : 0), 0);
  }
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return { domain: undefined as ResumeParsed["domain"], confidence: undefined as number | undefined };
  const [top, topScore] = entries[0];
  const second = entries[1]?.[1] ?? 0;
  // Full-Stack if both Frontend and Backend strong
  const fe = scores["Frontend"];
  const be = scores["Backend"];
  if (fe >= 2 && be >= 2 && Math.abs(fe - be) <= 1) {
    return { domain: "Full-Stack" as const, confidence: Math.min(1, 0.6 + 0.1 * (fe + be)) };
  }
  // Only return if clearly above others
  if (topScore >= Math.max(2, second + 2)) {
    return { domain: top as ResumeParsed["domain"], confidence: Math.min(1, 0.5 + 0.1 * topScore) };
  }
  return { domain: undefined as ResumeParsed["domain"], confidence: undefined };
}

// -------------------- Education --------------------
function inferEducation(educationLines: string[], text: string) {
  const hay = (educationLines.length ? educationLines.join("\n") : text);
  let edu: ResumeParsed["education"] | undefined;
  let conf = 0.0;
  if (/\bPhD|Doctorate\b/i.test(hay)) { edu = "PhD"; conf = 0.9; }
  else if (/\bMaster|MSc|MS\b/i.test(hay)) { edu = "Master"; conf = 0.8; }
  else if (/\bBachelor|BSc|BA|BS\b/i.test(hay)) { edu = "Bachelor"; conf = 0.7; }
  else if (/\bBoot\s*camp\b/i.test(hay)) { edu = "Bootcamp"; conf = 0.6; }
  return { education: edu, confidence: edu ? conf : undefined };
}

// -------------------- Main API --------------------
export function parseResumeFromExtraction(extraction: Extraction): ResumeParsed {
  const warnings: string[] = [];
  if (extraction.error) warnings.push(`pythonExtractorError: ${extraction.error}`);

  const { text, lines } = normalizeText(extraction.rawText || "", extraction.pages);
  const sections = detectSections(lines);
  const skillsRes = extractSkills({ skillsLines: sections.skillsLines, text });
  const yearsRes = estimateYearsExperience({ experienceLines: sections.experienceLines, text });
  const seniorRes = inferSeniority(yearsRes.yearsExperience, text, sections.experienceLines);
  const domainRes = inferDomain(skillsRes.skills);
  const eduRes = inferEducation(sections.educationLines, text);

  const parsed: ResumeParsed = {
    skills: skillsRes.skills,
    yearsExperience: yearsRes.yearsExperience,
    seniority: seniorRes.seniority,
    domain: domainRes.domain,
    education: eduRes.education,
    meta: {
      extractedWith: "pdfplumber",
      rawTextLength: (extraction.rawText || "").length,
      confidence: {
        skills: skillsRes.confidence,
        yearsExperience: yearsRes.confidence,
        seniority: seniorRes.confidence,
        domain: domainRes.confidence,
        education: eduRes.confidence,
      },
      warnings: warnings.length ? warnings : undefined,
      debug: {
        detectedSections: sections.detectedHeadings,
        experienceRanges: yearsRes.rangesPretty.length ? yearsRes.rangesPretty : undefined,
        matchedSkillTokens: skillsRes.matchedSkillTokens.length ? skillsRes.matchedSkillTokens : undefined,
      },
    },
  };

  return parsed;
}
