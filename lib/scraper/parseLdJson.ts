import type { CheerioAPI } from 'cheerio'

export interface LdJsonJobPosting {
  title?: string
  description?: string
  employmentType?: string | string[]
  hiringOrganization?: {
    name?: string
  }
  jobLocation?: Array<{
    address?: {
      addressLocality?: string
      addressRegion?: string
      addressCountry?: string
    }
  }>
  applicantLocationRequirements?: {
    name?: string
  }
  qualifications?: string
  experienceRequirements?: string
  skills?: string | string[]
  industry?: string | string[]
  responsibilities?: string
}

function collectJsonCandidates(value: unknown, results: LdJsonJobPosting[]) {
  if (!value) return
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonCandidates(item, results))
    return
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, any>
    const typeValue = obj['@type']
    const types = Array.isArray(typeValue) ? typeValue : [typeValue]
    if (types?.some((t) => typeof t === 'string' && t.toLowerCase() === 'jobposting')) {
      results.push(obj as LdJsonJobPosting)
      return
    }

    if (obj['@graph']) {
      collectJsonCandidates(obj['@graph'], results)
    }
  }
}

export function parseLdJson($: CheerioAPI): LdJsonJobPosting | null {
  const scripts = $('script[type="application/ld+json"]')
  const results: LdJsonJobPosting[] = []

  scripts.each((_, el) => {
    const raw = $(el).contents().text()
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      collectJsonCandidates(parsed, results)
    } catch {
      // Ignore invalid JSON
    }
  })

  return results[0] ?? null
}
