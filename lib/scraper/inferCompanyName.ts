import type { CheerioAPI } from 'cheerio'

export function inferCompanyName($: CheerioAPI, url: string, fallback?: string | null) {
  const ogSite = $('meta[property="og:site_name"]').attr('content')?.trim()
  if (ogSite) return ogSite

  const applicationName = $('meta[name="application-name"]').attr('content')?.trim()
  if (applicationName) return applicationName

  const title = $('title').text().trim()
  if (title) {
    const parts = title.split(/[-|–|•]/).map((part) => part.trim())
    if (parts.length > 1) return parts[0]
  }

  if (fallback) return fallback

  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname.split('.')[0]
  } catch {
    return ''
  }
}
