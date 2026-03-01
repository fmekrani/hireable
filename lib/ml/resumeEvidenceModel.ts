/**
 * Resume Evidence Model
 *
 * Tracks where skills appear in resume with confidence levels:
 * - Tier 3: Explicit mention in experience bullet/achievement  
 * - Tier 2: Mentioned in projects or other sections
 * - Tier 1: Only in skills list or summary
 *
 * This allows the scoring engine to:
 * 1. Not penalize missing explicit mentions if adjacent skills present
 * 2. Boost score for skills with higher evidence tiers
 * 3. Provide transparency in scoring
 */

import { canonicalizeSkill, isSoftSkill } from './skillCanonication';
import type { ParsedResume } from '../resume/parser';

// ===== TYPES =====

export type EvidenceTier = 1 | 2 | 3;

export interface SkillEvidence {
  skill: string;
  canonical: string;
  tier: EvidenceTier;
  isSoft: boolean;
  mentions: {
    section: 'experience' | 'project' | 'education' | 'certification' | 'summary' | 'skills_list';
    snippet: string;
    confidence: number; // 0-1
  }[];
}

export interface ResumeEvidenceMap {
  allSkills: string[];
  skillsByTier: {
    tier3: string[]; // from experience
    tier2: string[]; // from projects
    tier1: string[]; // from skills list
  };
  evidenceMap: Map<string, SkillEvidence>;
  softSkillsFound: Set<string>;
  hardSkillsFound: Set<string>;
}

// ===== SKILL EXTRACTION WITH EVIDENCE =====

/**
 * Extract skills from experience with high evidence tier
 */
function extractFromExperience(experience: ParsedResume['experience']): Map<string, SkillEvidence> {
  const skillMap = new Map<string, SkillEvidence>();

  experience.forEach((entry) => {
    // Combine title, company, and all highlights into one searchable text
    const fullText = [entry.title, entry.company, ...entry.highlights].filter(Boolean).join(' ').toLowerCase();

    // Very basic skill extraction: look for known skill keywords
    // In production, would use NLP or a comprehensive skill dictionary
    const commonSkills = [
      'react', 'vue', 'angular', 'node', 'express', 'python', 'java', 'sql', 'mongodb', 'docker', 'kubernetes', 
      'aws', 'gcp', 'azure', 'git', 'typescript', 'javascript', 'go', 'rust', 'c++', 'c#', '.net', 'django',
      'flask', 'fastapi', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'spark', 'hadoop', 'tensorflow',
      'pytorch', 'agile', 'scrum', 'ci/cd', 'jenkins', 'webpack', 'vite', 'graphql', 'rest', 'html', 'css',
      'tailwind', 'bootstrap', 'nextjs', 'nuxt', 'laravel', 'rails', 'spring', 'junit', 'pytest', 'jest',
      'tableau', 'power bi', 'looker', 'dbt', 'airflow', 'kafka', 'rabbitmq', 'microservices', 'testing',
      'testing', 'performance', 'optimization', 'scalability', 'security', 'devops'
    ];

    commonSkills.forEach((skill) => {
      if (fullText.includes(skill.toLowerCase())) {
        const canonical = canonicalizeSkill(skill);
        if (!skillMap.has(canonical)) {
          skillMap.set(canonical, {
            skill,
            canonical,
            tier: 3,
            isSoft: isSoftSkill(skill),
            mentions: [],
          });
        }
        skillMap.get(canonical)!.mentions.push({
          section: 'experience',
          snippet: entry.title || 'Experience',
          confidence: 0.9,
        });
      }
    });
  });

  return skillMap;
}

/**
 * Extract skills from projects with tier 2 evidence
 */
function extractFromProjects(projects: ParsedResume['projects'] | undefined): Map<string, SkillEvidence> {
  const skillMap = new Map<string, SkillEvidence>();

  if (!projects) return skillMap;

  projects.forEach((project) => {
    const { technologies, description, highlights } = project;

    // Explicit technologies array
    technologies.forEach((tech) => {
      const canonical = canonicalizeSkill(tech);
      if (!skillMap.has(canonical)) {
        skillMap.set(canonical, {
          skill: tech,
          canonical,
          tier: 2,
          isSoft: isSoftSkill(tech),
          mentions: [],
        });
      }
      skillMap.get(canonical)!.mentions.push({
        section: 'project',
        snippet: project.name || 'Project',
        confidence: 0.85,
      });
    });

    // Also check for skills mentioned in description or highlights (but lower confidence)
    const fullText = [description, ...highlights].filter(Boolean).join(' ').toLowerCase();
    const immediateSkills = [
      'react', 'vue', 'angular', 'node', 'express', 'python', 'java', 'sql', 'mongodb', 'docker',
      'typescript', 'javascript', 'graphql', 'rest', 'api'
    ];

    immediateSkills.forEach((skill) => {
      if (fullText.includes(skill.toLowerCase())) {
        const canonical = canonicalizeSkill(skill);
        if (!skillMap.has(canonical)) {
          skillMap.set(canonical, {
            skill,
            canonical,
            tier: 2,
            isSoft: isSoftSkill(skill),
            mentions: [],
          });
        }
        skillMap.get(canonical)!.mentions.push({
          section: 'project',
          snippet: project.name || 'Project Description',
          confidence: 0.7,
        });
      }
    });
  });

  return skillMap;
}

/**
 * Extract skills from explicit skills list (tier 1)
 */
function extractFromSkillsList(skillsSection: ParsedResume['skills']): Map<string, SkillEvidence> {
  const skillMap = new Map<string, SkillEvidence>();

  if (!skillsSection) return skillMap;

  // Combine all skill arrays
  const allSkills = [
    ...(skillsSection.technical || []),
    ...(skillsSection.languages || []),
    ...(skillsSection.frameworks || []),
    ...(skillsSection.tools || []),
    ...(skillsSection.all || []),
  ];

  // Deduplicate
  const uniqueSkills = Array.from(new Set(allSkills));

  uniqueSkills.forEach((skill) => {
    const canonical = canonicalizeSkill(skill);
    if (!skillMap.has(canonical)) {
      skillMap.set(canonical, {
        skill,
        canonical,
        tier: 1,
        isSoft: isSoftSkill(skill),
        mentions: [],
      });
    }
    skillMap.get(canonical)!.mentions.push({
      section: 'skills_list',
      snippet: 'Skills Section',
      confidence: 0.75,
    });
  });

  return skillMap;
}

/**
 * Extract skills from education (low relevance)
 */
function extractFromEducation(education: ParsedResume['education'] | undefined): Map<string, SkillEvidence> {
  const skillMap = new Map<string, SkillEvidence>();

  if (!education) return skillMap;

  education.forEach((entry) => {
    // Look for degree-related skills (e.g., "Computer Science", "Data Science")
    const degreeField = [entry.degree, entry.field].filter(Boolean).join(' ').toLowerCase();

    // Very limited extraction from education
    const degreeKeywords = [
      'data science', 'machine learning', 'computer science', 'software engineering',
      'statistics', 'mathematics', 'physics', 'chemistry', 'biology'
    ];

    degreeKeywords.forEach((keyword) => {
      if (degreeField.includes(keyword)) {
        const canonical = canonicalizeSkill(keyword);
        if (!skillMap.has(canonical)) {
          skillMap.set(canonical, {
            skill: keyword,
            canonical,
            tier: 1,
            isSoft: isSoftSkill(keyword),
            mentions: [],
          });
        }
        skillMap.get(canonical)!.mentions.push({
          section: 'education',
          snippet: entry.degree || 'Education',
          confidence: 0.5,
        });
      }
    });
  });

  return skillMap;
}

// ===== PUBLIC API =====

/**
 * Build comprehensive evidence map from parsed resume
 * Merges evidence from multiple sections, prioritizing higher tiers
 */
export function buildResumeEvidenceMap(parsedResume: ParsedResume): ResumeEvidenceMap {
  // Extract from all sections
  const experience = extractFromExperience(parsedResume.experience || []);
  const projects = extractFromProjects(parsedResume.projects);
  const skillsList = extractFromSkillsList(parsedResume.skills);
  const education = extractFromEducation(parsedResume.education);

  // Merge maps, prioritizing higher evidence tiers
  const merged = new Map<string, SkillEvidence>();

  // Priority: experience (tier 3) > projects (tier 2) > skills list (tier 1) > education (tier 1)
  [experience, projects, skillsList, education].forEach((map) => {
    map.forEach((evidence, skill) => {
      if (merged.has(skill)) {
        // Merge mentions, upgrade tier if higher
        const existing = merged.get(skill)!;
        existing.tier = Math.max(existing.tier, evidence.tier) as EvidenceTier;
        existing.mentions.push(...evidence.mentions);
      } else {
        merged.set(skill, evidence);
      }
    });
  });

  // Build tier-based lists and categorize soft vs hard
  const tier3 = new Set<string>();
  const tier2 = new Set<string>();
  const tier1 = new Set<string>();
  const softSkills = new Set<string>();
  const hardSkills = new Set<string>();

  merged.forEach((evidence, skill) => {
    if (evidence.tier === 3) tier3.add(skill);
    else if (evidence.tier === 2) tier2.add(skill);
    else tier1.add(skill);

    if (evidence.isSoft) softSkills.add(skill);
    else hardSkills.add(skill);
  });

  return {
    allSkills: Array.from(merged.keys()),
    skillsByTier: {
      tier3: Array.from(tier3),
      tier2: Array.from(tier2),
      tier1: Array.from(tier1),
    },
    evidenceMap: merged,
    softSkillsFound: softSkills,
    hardSkillsFound: hardSkills,
  };
}

/**
 * Check if a resume likely has a skill even if not explicitly mentioned
 * Uses evidence tiers to compute confidence
 */
export function getSkillConfidence(evidence: ResumeEvidenceMap, skillCanonical: string): number {
  const skillEvidence = evidence.evidenceMap.get(skillCanonical);

  if (!skillEvidence) {
    return 0; // No evidence
  }

  // Map tier to confidence
  if (skillEvidence.tier === 3) return 0.95;
  if (skillEvidence.tier === 2) return 0.80;
  if (skillEvidence.tier === 1) return 0.65;

  return 0;
}

/**
 * Get hard skills only (filter out soft skills)
 */
export function getHardSkills(evidence: ResumeEvidenceMap): string[] {
  return Array.from(evidence.hardSkillsFound);
}

/**
 * Get soft skills only
 */
export function getSoftSkills(evidence: ResumeEvidenceMap): string[] {
  return Array.from(evidence.softSkillsFound);
}

/**
 * Get skills by tier
 */
export function getSkillsByTier(evidence: ResumeEvidenceMap, tier: EvidenceTier): string[] {
  if (tier === 3) return evidence.skillsByTier.tier3;
  if (tier === 2) return evidence.skillsByTier.tier2;
  if (tier === 1) return evidence.skillsByTier.tier1;
  return [];
}
