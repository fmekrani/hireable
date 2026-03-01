import type { CheerioAPI } from 'cheerio'
import type { Element } from 'domhandler'

export interface JobSections {
  title: string | null
  description: string
  sections: Record<string, string>
}

function normalizeHeading(text: string) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function collectSectionText($: CheerioAPI, heading: Element) {
  const parts: string[] = []
  let current = $(heading).next()

  while (current.length) {
    if (current.is('h1,h2,h3,h4')) break
    const text = current.text().trim()
    if (text) parts.push(text)
    current = current.next()
  }

  return parts.join('\n')
}

export function extractJobSections($: CheerioAPI): JobSections {
  const title = $('h1').first().text().trim() || null

  const mainText = $('main, article, [role="main"]').first().text().trim()
  const description = mainText || $('body').text().trim()

  const sections: Record<string, string> = {}
  $('h2, h3, h4').each((_, el) => {
    const heading = $(el).text().trim()
    if (!heading) return

    const key = normalizeHeading(heading)
    const body = collectSectionText($, el)
    if (body) {
      sections[key] = body
    }
  })

  return {
    title,
    description,
    sections,
  }
}
