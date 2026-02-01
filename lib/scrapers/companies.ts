/**
 * Company Career Page Configurations
 * 
 * Defines CSS selectors for scraping job listings from different companies.
 * Used by scripts/company_scraper.py
 */

export interface CompanyConfig {
  name: string
  careersUrl: string
  jobLinkSelector: string
  titleSelector: string
  descriptionSelector: string
  locationSelector?: string
  nextPageSelector?: string
}

export const COMPANIES: CompanyConfig[] = [
  {
    name: "Google",
    careersUrl: "https://careers.google.com/jobs/results/",
    jobLinkSelector: "a[href*='/jobs/results/'], a.gs-title-link",
    titleSelector: "h1, .gc-job-details__title",
    descriptionSelector: ".gc-job-details__description, .job-description",
    locationSelector: ".gc-job-info__location, .location",
    nextPageSelector: "a[rel='next']"
  },
  {
    name: "Amazon",
    careersUrl: "https://www.amazon.jobs/en",
    jobLinkSelector: "a[href*='/job/'], a.job-card-link",
    titleSelector: "h1, .job-title",
    descriptionSelector: ".job-description, .description",
    locationSelector: ".location, .job-location",
    nextPageSelector: "a[rel='next']"
  },
  {
    name: "Meta",
    careersUrl: "https://www.metacareers.com/jobs",
    jobLinkSelector: "a[href*='/job/'], a.job-card__link",
    titleSelector: "h1, .job-title",
    descriptionSelector: ".description, .job-description",
    locationSelector: ".job-location, .location",
    nextPageSelector: "a[rel='next']"
  },
  {
    name: "Microsoft",
    careersUrl: "https://careers.microsoft.com/us/en/job-search-results",
    jobLinkSelector: "a[href*='/job/'], a.job-card",
    titleSelector: "h1, .job-title",
    descriptionSelector: ".job-description, .description",
    locationSelector: ".location",
    nextPageSelector: "a[rel='next']"
  },
  {
    name: "Apple",
    careersUrl: "https://jobs.apple.com",
    jobLinkSelector: "a[href*='/job/'], a.result-item-link",
    titleSelector: "h1, .job-title",
    descriptionSelector: ".job-description",
    locationSelector: ".location",
    nextPageSelector: "a[rel='next']"
  }
]

export function getCompanyConfig(name: string): CompanyConfig | null {
  return COMPANIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || null
}

export function getAvailableCompanies(): string[] {
  return COMPANIES.map(c => c.name)
}

export default COMPANIES
