import { NextRequest, NextResponse } from 'next/server'
import { load } from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { fetchHtml } from '@/lib/scraper/fetchHtml'
import { parseLdJson } from '@/lib/scraper/parseLdJson'
import { extractJobSections } from '@/lib/scraper/extractJobSections'
import { extractSkills } from '@/lib/scraper/extractSkills'
import { inferCompanyName } from '@/lib/scraper/inferCompanyName'

interface ScrapeRequestBody {
  jobUrl?: string
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function extractYearsRequired(text: string): number | null {
  const match = text.match(/(\d{1,2})\+?\s+years?/i)
  if (!match) return null
  const years = Number(match[1])
  if (Number.isNaN(years)) return null
  if (years > 25) return null
  return years
}

function resolveLocation(ldJson: ReturnType<typeof parseLdJson>) {
  const location = ldJson?.jobLocation?.[0]?.address
  if (location?.addressLocality) {
    return [location.addressLocality, location.addressRegion, location.addressCountry]
      .filter(Boolean)
      .join(', ')
  }
  return ldJson?.applicantLocationRequirements?.name ?? null
}

export async function POST(request: NextRequest) {
  let jobUrl = ''

  try {
    const body = (await request.json()) as ScrapeRequestBody
    jobUrl = body?.jobUrl?.trim() ?? ''

    if (!jobUrl || !isValidUrl(jobUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid jobUrl' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

    const supabase = token && supabaseUrl && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        })
      : await createServerSupabaseClient()

    const user = token
      ? (await supabase.auth.getUser()).data.user
      : await getServerUser()

    // Allow anonymous access for temporary scrape debug endpoint
    // const allowAnonymous = process.env.NODE_ENV !== 'production'
    // if (!user && !allowAnonymous) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    let html = ''
    let finalUrl = jobUrl
    let scrapeError: string | null = null

    try {
      const result = await fetchHtml(jobUrl)
      html = result.html
      finalUrl = result.finalUrl
    } catch (error) {
      scrapeError = error instanceof Error ? error.message : String(error)
    }

    const $ = html ? load(html) : load('<html></html>')
    const ldJson = html ? parseLdJson($) : null
    const { title, description, sections } = html
      ? extractJobSections($)
      : { title: null, description: '', sections: {} }

    const sectionsWithLdJson = { ...sections }
    const appendSection = (key: string, value?: string | string[] | null) => {
      if (!value) return
      const text = Array.isArray(value) ? value.join('\n') : String(value)
      const existing = sectionsWithLdJson[key]
      sectionsWithLdJson[key] = existing ? `${existing}\n${text}` : text
    }

    appendSection('requirements', ldJson?.experienceRequirements ?? null)
    appendSection('qualifications', ldJson?.qualifications ?? null)
    appendSection('requirements', ldJson?.skills ?? null)

    const jobTitle = ldJson?.title || title || 'Unknown Position'
    let companyName =
      ldJson?.hiringOrganization?.name ||
      inferCompanyName($, finalUrl, ldJson?.hiringOrganization?.name || null)
    
    // If company name is still empty, try to extract from description or title
    if (!companyName || companyName.length === 0) {
      companyName = title?.split(' at ')?.pop()?.trim() || 'Unknown Company'
    }

    const descriptionText =
      (ldJson?.description ? String(ldJson.description) : '') || description || ''

    const skillExtraction = extractSkills({
      description: descriptionText,
      sections: sectionsWithLdJson,
    })

    const requiredSkills = skillExtraction.requiredSkills
    const preferredSkills = skillExtraction.preferredSkills
    const qualities = skillExtraction.qualities

    const yearsRequired = extractYearsRequired(
      [
        sectionsWithLdJson['requirements'],
        sectionsWithLdJson['qualifications'],
        sectionsWithLdJson['minimum qualifications'],
        ldJson?.experienceRequirements,
      ]
        .filter(Boolean)
        .join('\n')
    )

    const jobData = {
      job_title: jobTitle,
      company_name: companyName,
      job_url: finalUrl,
      description: descriptionText || 'No description available',
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      qualities,
      years_required: yearsRequired,
      location: resolveLocation(ldJson) || 'Location not specified',
      employment_type: ldJson?.employmentType ?? 'Not specified',
      tech_stack: skillExtraction.techStack,
      raw_html_length: html.length,
      scrape_error: scrapeError,
      source: 'job_scrape_v1',
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        job_search_id: null,
        job: {
          job_title: jobTitle,
          company_name: companyName,
          required_skills: requiredSkills,
          preferred_skills: preferredSkills,
          qualities,
        },
        job_data: jobData,
      })
    }

    const { data, error } = await supabase
      .from('job_searches')
      .insert({
        user_id: user.id,
        company_name: companyName,
        job_title: jobTitle,
        job_url: finalUrl,
        job_data: jobData,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        qualities,
        years_required: yearsRequired,
        search_date: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Job Scrape] Insert error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save job search',
          job: {
            job_title: jobTitle,
            company_name: companyName,
            required_skills: requiredSkills,
            preferred_skills: preferredSkills,
            qualities,
          },
          job_data: jobData,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      job_search_id: data.id,
      job: {
        job_title: jobTitle,
        company_name: companyName,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        qualities,
      },
      job_data: jobData,
    })
  } catch (error) {
    console.error('[Job Scrape] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error during job scrape',
        job: {
          job_title: '',
          company_name: '',
          required_skills: [],
          preferred_skills: [],
          qualities: [],
        },
        job_data: null,
      },
      { status: 500 }
    )
  }
}
