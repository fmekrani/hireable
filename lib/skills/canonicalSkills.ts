import { SKILL_DICTIONARY } from '@/lib/resume/skillDictionary'
import { SKILL_ALIASES, TECH_SKILL_VOCABULARY } from '@/lib/ml/skillVocabulary'

const EXTRA_CANONICAL_ALIASES: Record<string, string[]> = {
  'Power BI': ['Power BI', 'PowerBI', 'powerbi', 'PBI', 'pbi'],
  'SQL Server': ['SQL Server', 'sql server', 'MSSQL', 'mssql', 'Microsoft SQL Server'],
  'Node.js': ['Node.js', 'NodeJS', 'nodejs', 'node js'],
}

const TECH_STACK_LANGUAGES = new Set([
  'sql',
  'python',
  'java',
  'javascript',
  'typescript',
  'c++',
  'c#',
  'go',
  'rust',
  'scala',
  'kotlin',
  'r',
  'php',
  'ruby',
])

function toCanonicalLabel(input: string): string {
  const lower = input.toLowerCase().trim()
  if (lower === 'powerbi') return 'Power BI'
  if (lower === 'scikit-learn') return 'Scikit-Learn'
  return input.trim()
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildBoundaryRegex(token: string): RegExp {
  if (/^Go$/i.test(token)) {
    return new RegExp(String.raw`(?<!Goo)\bGo\b`, 'i')
  }
  if (/^R$/i.test(token)) {
    return new RegExp(String.raw`(?:^|[\s,;\(\)\[\]])R(?:$|[\s,;\+\)\]\./])`, 'i')
  }
  return new RegExp(String.raw`\b${escapeRegex(token)}\b`, 'i')
}

const canonicalToAliases = new Map<string, Set<string>>()

function addAlias(canonical: string, alias: string) {
  const canonicalLabel = toCanonicalLabel(canonical)
  if (!canonicalToAliases.has(canonicalLabel)) {
    canonicalToAliases.set(canonicalLabel, new Set([canonicalLabel]))
  }
  canonicalToAliases.get(canonicalLabel)!.add(alias)
}

for (const [canonical, aliases] of Object.entries(SKILL_DICTIONARY)) {
  addAlias(canonical, canonical)
  aliases.forEach((alias) => addAlias(canonical, alias))
}

for (const canonical of TECH_SKILL_VOCABULARY) {
  addAlias(canonical, canonical)
}

for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
  addAlias(canonical, alias)
}

for (const [canonical, aliases] of Object.entries(EXTRA_CANONICAL_ALIASES)) {
  addAlias(canonical, canonical)
  aliases.forEach((alias) => addAlias(canonical, alias))
}

export const CANONICAL_SKILLS_MAP: Record<string, string[]> = Object.fromEntries(
  Array.from(canonicalToAliases.entries()).map(([canonical, aliases]) => [canonical, Array.from(aliases)])
)

export interface SkillMatch {
  canonical: string
  confidence: number
  source?: string
}

export function normalizeSkillsFromText(
  text: string,
  whitelist?: Set<string>
): string[] {
  if (!text?.trim()) return []

  const whitelistSet = whitelist
    ? new Set(Array.from(whitelist).map((skill) => skill.toLowerCase()))
    : null
  const matches: Array<{ canonical: string; index: number }> = []

  for (const [canonical, aliases] of Object.entries(CANONICAL_SKILLS_MAP)) {
    if (whitelistSet && !whitelistSet.has(canonical.toLowerCase())) {
      continue
    }

    let earliestIndex = Number.POSITIVE_INFINITY

    for (const alias of aliases) {
      const regex = buildBoundaryRegex(alias)
      const hit = regex.exec(text)
      if (hit && typeof hit.index === 'number') {
        earliestIndex = Math.min(earliestIndex, hit.index)
      }
    }

    if (earliestIndex !== Number.POSITIVE_INFINITY) {
      matches.push({ canonical, index: earliestIndex })
    }
  }

  return matches
    .sort((a, b) => a.index - b.index || a.canonical.localeCompare(b.canonical))
    .map((item) => item.canonical)
}

export function filterTechStack(skills: string[]): string[] {
  return skills.filter((skill) => TECH_STACK_LANGUAGES.has(skill.toLowerCase()))
}

export interface SkillOverlap {
  matched: string[]
  missing: string[]
  matchPercentage: number
}

export function getSkillOverlap(
  resumeSkills: string[],
  jobSkills: string[]
): SkillOverlap {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()))
  const matched = jobSkills.filter((skill) => resumeSet.has(skill.toLowerCase()))
  const missing = jobSkills.filter((skill) => !resumeSet.has(skill.toLowerCase()))

  const matchPercentage = jobSkills.length > 0
    ? Math.round((matched.length / jobSkills.length) * 100)
    : 0

  return { matched, missing, matchPercentage }
}

export function getSkillOverlapSummary(
  resumeSkills: string[],
  jobSkills: string[]
): {
  matchedSkills: string[]
  missingSkills: string[]
  score: number
} {
  const overlap = getSkillOverlap(resumeSkills, jobSkills)
  return {
    matchedSkills: overlap.matched,
    missingSkills: overlap.missing,
    score: overlap.matchPercentage,
  }
}
