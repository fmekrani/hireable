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

  // Try multiple ways to get main content
  let mainText = ''
  
  // Try main/article elements first
  const mainElem = $('main, article, [role="main"]').first().text().trim()
  if (mainElem && mainElem.length > 500) {
    mainText = mainElem
  }
  
  // If that didn't work, get content div or container
  if (!mainText) {
    const contentDiv = $('[class*="content"], [class*="container"], [class*="job-description"]').first().text().trim()
    if (contentDiv && contentDiv.length > 500) {
      mainText = contentDiv
    }
  }
  
  // Last resort: get most of body but exclude script/style
  if (!mainText) {
    const body = $('body').clone()
    body.find('script, style, nav, footer, [class*="nav"], [class*="header"]').remove()
    mainText = body.text().trim()
  }

  const description = mainText || $('body').text().trim()

  const sections: Record<string, string> = {}
  $('h2, h3, h4, h5').each((_, el) => {
    const heading = $(el).text().trim()
    if (!heading || heading.length < 3) return

    const key = normalizeHeading(heading)
    const body = collectSectionText($, el)
    if (body && body.length > 10) {
      sections[key] = body
    }
  })

  return {
    title,
    description,
    sections,
  }
}
