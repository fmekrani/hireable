import type { CheerioAPI } from 'cheerio'

export function inferCompanyName($: CheerioAPI, url: string, fallback?: string | null) {
  // Try JSON-LD first (more reliable)
  const ogSite = $('meta[property="og:site_name"]').attr('content')?.trim()
  if (ogSite && ogSite !== 'LinkedIn' && ogSite !== 'Job Board') return ogSite

  const applicationName = $('meta[name="application-name"]').attr('content')?.trim()
  if (applicationName && applicationName !== 'LinkedIn') return applicationName

  // Try to extract company name from page content
  // Look for strong company indicators in common page elements
  const headerText = $('header').text().trim()
  if (headerText) {
    const matches = headerText.match(/^([A-Z][A-Za-z0-9\s&-]{2,50}?)\s+(?:is|has|helping|provides|company)/i)
    if (matches) return matches[1]
  }

  // Try title tag
  const title = $('title').text().trim()
  if (title) {
    const parts = title.split(/[-|–|•]/).map((part) => part.trim())
    // If first part looks like a company name (not too long, no "job" keywords)
    if (parts[0] && parts[0].length < 100 && !parts[0].toLowerCase().includes('job') && !parts[0].toLowerCase().includes('careers')) {
      return parts[0]
    }
  }

  // Try h1 which often contains company name
  const h1 = $('h1').first().text().trim()
  if (h1 && h1.length < 100 && h1.split(/\s+/).length < 10) {
    return h1
  }

  // Try to extract from meta description or og:description
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim()
  if (ogDesc) {
    const companyMatch = ogDesc.match(/(?:at|for|by|from)\s+([A-Z][A-Za-z0-9\s&-]{2,50}?)(?:\s|$|\.)/i)
    if (companyMatch) return companyMatch[1]
  }

  if (fallback) return fallback

  // Last resort: extract from hostname, but skip obvious job board domains
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const domain = hostname.split('.')[0]
    // Skip obvious job boards
    if (!['linkedin', 'greenhouse', 'jobsboard', 'jobs', 'careers', 'indeed'].includes(domain.toLowerCase())) {
      return domain
    }
  } catch {
    return ''
  }
  
  return ''
}
