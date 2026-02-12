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

const aliasMatchers = Array.from(aliasMap.entries()).map(([alias, canonical]) => {
  const escaped = escapeRegex(alias)
  const regex = new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, 'i')
  return { canonical, regex }
})

function collectSkills(text: string): string[] {
  if (!text) return []
  const hits = new Set<string>()
  for (const matcher of aliasMatchers) {
    if (matcher.regex.test(text)) {
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

  const hasStructuredSections = Boolean(requiredText || preferredText || qualitiesText)
  const requiredSources = hasStructuredSections
    ? [requiredText]
    : [input.description]
  const preferredSources = hasStructuredSections
    ? [preferredText]
    : []
  const qualitiesSources = hasStructuredSections
    ? [qualitiesText]
    : []

  const requiredSkills = collectFromTexts(requiredSources)
  const preferredSkills = collectFromTexts(preferredSources)
  const qualities = collectFromTexts(qualitiesSources)

  const techStack = requiredSkills.filter((skill) => SKILL_DICTIONARY[skill])

  return {
    requiredSkills,
    preferredSkills,
    qualities,
    techStack,
  }
}
