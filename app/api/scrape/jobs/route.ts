import { NextResponse, NextRequest } from 'next/server'
import { getCompanyConfig, getAvailableCompanies } from '@/lib/scrapers/companies'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

interface ScrapeRequest {
  companyName: string
  maxPages?: number
}

interface JobOutput {
  title: string
  requiredSkills: string[]
  yearsRequired: string
  seniority: 'Entry' | 'Mid' | 'Senior' | 'Principal'
  domain: 'Frontend' | 'Backend' | 'Full-Stack' | 'DevOps' | 'Data'
  location?: string
  description: string
  url: string
}

/**
 * POST /api/scrape/jobs
 * 
 * Scrape jobs from a company careers page
 * 
 * Request: { "companyName": "Google", "maxPages": 2 }
 * Response: { "success": true, "company": "Google", "jobs": [...] }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ScrapeRequest = await request.json()
    const { companyName, maxPages = 2 } = body

    if (!companyName) {
      return NextResponse.json(
        {
          error: 'companyName required',
          availableCompanies: getAvailableCompanies()
        },
        { status: 400 }
      )
    }

    const config = getCompanyConfig(companyName)
    if (!config) {
      return NextResponse.json(
        {
          error: `Company "${companyName}" not found`,
          availableCompanies: getAvailableCompanies()
        },
        { status: 404 }
      )
    }

    const validMaxPages = Math.min(Math.max(1, maxPages), 10)

    console.log(`🔍 Scraping ${config.name}...`)

    // Create temp config file
    const tmpDir = os.tmpdir()
    const configFile = path.join(tmpDir, `config_${Date.now()}.json`)
    const outputFile = path.join(tmpDir, `output_${Date.now()}.json`)

    await fs.writeFile(configFile, JSON.stringify(config))

    return new Promise((resolve) => {
      const proc = spawn('python3', [
        'scripts/company_scraper.py',
        '--config', configFile,
        '--max-pages', validMaxPages.toString(),
        '--output', outputFile
      ])

      let stderr = ''

      proc.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', async (code) => {
        try {
          await fs.unlink(configFile).catch(() => {})

          if (code !== 0) {
            console.error('Scraper failed:', stderr)
            return resolve(
              NextResponse.json(
                { error: 'Scraper failed', details: stderr },
                { status: 500 }
              )
            )
          }

          const output = await fs.readFile(outputFile, 'utf-8')
          const jobs: JobOutput[] = JSON.parse(output)

          await fs.unlink(outputFile).catch(() => {})

          console.log(`✅ Found ${jobs.length} jobs`)

          return resolve(
            NextResponse.json({
              success: true,
              company: config.name,
              jobsScraped: jobs.length,
              jobs
            })
          )
        } catch (e) {
          console.error('Error:', e)
          return resolve(
            NextResponse.json(
              { error: 'Processing failed', details: String(e) },
              { status: 500 }
            )
          )
        }
      })
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'API error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/scrape/jobs
 * 
 * List available companies and show API usage
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Job scraper API',
    availableCompanies: getAvailableCompanies(),
    usage: {
      method: 'POST',
      body: {
        companyName: 'string (required)',
        maxPages: 'number (optional, default 2)'
      },
      example: {
        companyName: 'Google',
        maxPages: 2
      }
    }
  })
}
