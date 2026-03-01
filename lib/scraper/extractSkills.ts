import { SKILL_DICTIONARY } from '@/lib/resume/skillDictionary'
import { TECH_SKILL_VOCABULARY, SKILL_ALIASES } from '@/lib/ml/skillVocabulary'

export interface ExtractedSkills {
  requiredSkills: string[]
  preferredSkills: string[]
  qualities: string[]
  techStack: string[]
}

const REQUIRED_KEYS = [
  'requirements',
  'qualifications',
  "what you’ll need",
  "what you'll need",
  'what you need',
  'must have',
  'required',
  'minimum qualifications',
]

const PREFERRED_KEYS = [
  'preferred',
  'nice to have',
  'bonus',
  'preferred qualifications',
]

const QUALITIES_KEYS = ['soft skills', 'qualities', 'traits', 'who you are']

function findSectionText(sections: Record<string, string>, keys: string[]) {
  for (const key of Object.keys(sections)) {
    if (keys.some((match) => key.includes(match))) {
      return sections[key]
    }
  }
  return ''
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const aliasMap = new Map<string, string>()

function addAlias(alias: string, canonical: string) {
  if (!alias) return
  aliasMap.set(alias.toLowerCase(), canonical)
}

const canonicalSkills = Array.from(
  new Set([...Object.keys(SKILL_DICTIONARY), ...TECH_SKILL_VOCABULARY])
)

for (const canonical of canonicalSkills) {
  addAlias(canonical, canonical)
  const aliases = SKILL_DICTIONARY[canonical]
  if (aliases) {
    aliases.forEach((alias) => addAlias(alias, canonical))
  }
}

for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
  addAlias(alias, canonical)
}

// Whitelist of actual technical and professional skills to extract
const SKILL_WHITELIST = new Set([
  // Programming Languages
  'SQL', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
  'Scala', 'Kotlin', 'PHP', 'Ruby', 'R', 'MATLAB', 'Swift', 'Kotlin',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'Spark', 'BigQuery',
  // BI/Analytics Tools
  'Tableau', 'Looker', 'PowerBI', 'Qlik', 'Microstrategy',
  // Cloud & Infrastructure
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
  // Data & ML
  'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'Analytics',
  'Statistics', 'Probability', 'ETL', 'Data Warehouse', 'Data Lakes',
  // Tools
  'Excel', 'Git', 'JIRA', 'Confluence', 'Salesforce', 'SAP', 'Oracle',
  // Frameworks
  'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring',
  // OS/General
  'Linux', 'Unix', 'Windows', 'Mac',
  // Soft Skills/Professional
  'Project Management', 'Agile', 'Scrum', 'Communication', 'Leadership',
  'Problem Solving', 'Critical Thinking', 'Teamwork', 'Collaboration',
  'Data Analysis', 'Visualization', 'Storytelling', 'Presentation'
])

const aliasMatchers = Array.from(aliasMap.entries()).map(([alias, canonical]) => {
  const escaped = escapeRegex(alias)
  const regex = new RegExp(`\\b${escaped}\\b`, 'i')
  return { canonical, regex, alias }
})

function collectSkills(text: string): string[] {
  if (!text) return []
  const hits = new Set<string>()
  for (const matcher of aliasMatchers) {
    // Only match if the canonical name is in the whitelist
    if (SKILL_WHITELIST.has(matcher.canonical) && matcher.regex.test(text)) {
      hits.add(matcher.canonical)
    }
  }
  return Array.from(hits)
}

function collectFromTexts(texts: string[]): string[] {
  const results = new Set<string>()
  texts
    .map((text) => text?.trim())
    .filter(Boolean)
    .forEach((text) => {
      collectSkills(text).forEach((skill) => results.add(skill))
    })
  return Array.from(results)
}

export function extractSkills(input: {
  description: string
  sections: Record<string, string>
}): ExtractedSkills {
  const requiredText = findSectionText(input.sections, REQUIRED_KEYS)
  const preferredText = findSectionText(input.sections, PREFERRED_KEYS)
  const qualitiesText = findSectionText(input.sections, QUALITIES_KEYS)

  // Try structured sections first, but fall back to description if sections are empty
  const hasGoodSections = Boolean(requiredText && requiredText.length > 50)
  
  let requiredSkills: string[] = []
  let preferredSkills: string[] = []
  let qualities: string[] = []

  // Use structured sections if available
  if (requiredText && requiredText.length > 20) {
    requiredSkills = collectFromTexts([requiredText])
  } 
  // Fallback: search full description
  else if (input.description && input.description.length > 100) {
    requiredSkills = collectFromTexts([input.description])
  }

  if (preferredText && preferredText.length > 20) {
    preferredSkills = collectFromTexts([preferredText])
  }

  if (qualitiesText && qualitiesText.length > 20) {
    qualities = collectFromTexts([qualitiesText])
  }

  // Tech stack: only real programming languages from required skills
  const techStack = requiredSkills.filter((skill) => {
    const lower = skill.toLowerCase()
    return [
      'sql', 'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 
      'go', 'rust', 'scala', 'kotlin', 'r', 'php', 'ruby'
    ].includes(lower)
  })

  return {
    requiredSkills,
    preferredSkills,
    qualities,
    techStack,
  }
}
