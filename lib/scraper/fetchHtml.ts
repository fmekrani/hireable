export interface FetchHtmlResult {
  html: string
  finalUrl: string
}

const DEFAULT_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
}

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const response = await fetch(url, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  return {
    html,
    finalUrl: response.url || url,
  }
}
