/**
 * Canonical Skills Normalization Module
 * 
 * Used by both:
 * - Job Web Scraper (/lib/scraper/extractSkills.ts)
 * - Resume Parser (/lib/resume/parse.ts)
 * 
 * Maps skill aliases to canonical names using SKILL_DICTIONARY from
 * /lib/resume/skillDictionary.ts
 */

import { SKILL_DICTIONARY } from '@/lib/resume/skillDictionary'

/**
 * Build a regex that matches a skill token with word boundaries
 * Handles special cases like "Go" and "R" that can be ambiguous
 */
function buildBoundaryRegex(token: string): RegExp {
  // Special handling for Go (avoid matching Google/Googler)
  if (/^Go$/i.test(token)) {
    return new RegExp(String.raw`(?<!Goo)\bGo\b`, 'i')
  }
  // Special handling for R (avoid matching words like "are", "for", etc.)
  if (/^R$/i.test(token)) {
    return new RegExp(String.raw`(?:^|[\s,;\(\)\[\]])R(?:$|[\s,;\+\)\]\./])`, 'i')
  }
  // Default: word boundary around token
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(String.raw`\b${escaped}\b`, 'i')
}

export interface SkillMatch {
  canonical: string // e.g., "Node.js"
  confidence: number // 0-1
  source?: string // optional tracking of where match came from
}

/**
 * Normalize raw text to extract canonical skill names
 * 
 * Filters for only skills from a whitelist to avoid false positives
 * Returns canonical names sorted alphabetically
 * 
 * @param text - Raw text containing skill mentions
 * @param whitelist - Set of canonical names to include (optional, uses all if not provided)
 * @returns Sorted array of canonical skill names
 */
export function normalizeSkillsFromText(
  text: string,
  whitelist?: Set<string>
): string[] {
  if (!text || text.length === 0) {
    return []
  }

  const matched = new Set<string>()

  // Iterate through skill dictionary
  for (const [canonical, aliases] of Object.entries(SKILL_DICTIONARY)) {
    // Skip if whitelist is provided and canonical not in it
    if (whitelist && !whitelist.has(canonical)) {
      continue
    }

    // Check each alias
    for (const alias of aliases) {
      const regex = buildBoundaryRegex(alias)
      if (regex.test(text)) {
        matched.add(canonical)
        break // Found this canonical skill, move to next
      }
    }
  }

  // Return sorted canonical names
  return Array.from(matched).sort((a, b) => a.localeCompare(b))
}

/**
 * Filter skills to only programming languages
 * Used by job scraper as "tech_stack"
 */
export function filterTechStack(skills: string[]): string[] {
  const techLanguages = new Set([
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

  return skills.filter((skill) => techLanguages.has(skill.toLowerCase()))
}

/**
 * Get skill overlap between two sets
 * Used for matching resume skills against job requirements
 */
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
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase()))

  const matched: string[] = []
  jobSkills.forEach((skill) => {
    if (resumeSet.has(skill.toLowerCase())) {
      matched.push(skill)
    }
  })

  const missing = jobSkills.filter((skill) => !resumeSet.has(skill.toLowerCase()))

  const matchPercentage = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 0

  return {
    matched,
    missing,
    matchPercentage: Math.round(matchPercentage),
  }
}
