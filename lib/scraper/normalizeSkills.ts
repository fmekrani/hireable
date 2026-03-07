const SPLIT_REGEX = /\s*(?:,|\/|\||;|\band\b|\bor\b|\n|\r|\t|\u2022|\u2023|\u25E6|\u2043|\u2219)\s*/gi

export function splitSkillText(text: string): string[] {
  if (!text) return []
  return text
    .split(SPLIT_REGEX)
    .map((item) => item.replace(/[•\-–]+/g, ' ').trim())
    .filter(Boolean)
}

export function normalizeSkills(items: string[]): string[] {
  const normalized = items
    .flatMap((item) => splitSkillText(item))
    .map((item) => item.toLowerCase().trim())
    .filter((item) => item.length > 1)

  return Array.from(new Set(normalized))
}
