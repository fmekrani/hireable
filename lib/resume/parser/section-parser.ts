/**
 * Resume Section Parser
 * 
 * Parses raw resume text into structured sections.
 * Identifies common resume sections and extracts their content.
 */

export interface ParsedResume {
  /** Contact information */
  contact: ContactInfo
  /** Professional summary or objective */
  summary: string | null
  /** Work experience entries */
  experience: ExperienceEntry[]
  /** Education entries */
  education: EducationEntry[]
  /** Skills list */
  skills: SkillsSection
  /** Certifications */
  certifications: string[]
  /** Projects */
  projects: ProjectEntry[]
  /** Languages spoken */
  languages: string[]
  /** Awards and achievements */
  awards: string[]
  /** Raw sections that couldn't be parsed */
  rawSections: Record<string, string>
}

export interface ContactInfo {
  name: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  location: string | null
}

export interface ExperienceEntry {
  title: string | null
  company: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  current: boolean
  description: string
  highlights: string[]
}

export interface EducationEntry {
  degree: string | null
  field: string | null
  institution: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  gpa: string | null
  highlights: string[]
}

export interface SkillsSection {
  technical: string[]
  soft: string[]
  tools: string[]
  languages: string[]
  frameworks: string[]
  all: string[]
}

export interface ProjectEntry {
  name: string | null
  description: string
  technologies: string[]
  url: string | null
  highlights: string[]
}

// Common section header patterns
const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^(?:summary|professional\s*summary|objective|profile|about\s*me|career\s*objective|personal\s*statement)\s*:?\s*$/i,
  experience: /^(?:experience|work\s*experience|employment|professional\s*experience|work\s*history|career\s*history|relevant\s*experience)\s*:?\s*$/i,
  education: /^(?:education|academic\s*background|qualifications|academic\s*qualifications|educational\s*background)\s*:?\s*$/i,
  skills: /^(?:skills|technical\s*skills|core\s*competencies|competencies|areas\s*of\s*expertise|expertise|technologies|tech\s*stack)\s*:?\s*$/i,
  certifications: /^(?:certifications?|certificates?|licenses?|professional\s*certifications?|credentials)\s*:?\s*$/i,
  projects: /^(?:projects?|personal\s*projects?|side\s*projects?|portfolio|key\s*projects?)\s*:?\s*$/i,
  languages: /^(?:languages?|spoken\s*languages?)\s*:?\s*$/i,
  awards: /^(?:awards?|honors?|achievements?|recognition|accomplishments?)\s*:?\s*$/i,
  publications: /^(?:publications?|papers?|research)\s*:?\s*$/i,
  interests: /^(?:interests?|hobbies|activities)\s*:?\s*$/i,
}

// Regex patterns for extracting specific data
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
  linkedin: /(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/i,
  github: /(?:github\.com\/|github:\s*)([a-zA-Z0-9_-]+)/i,
  website: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,})(?:\/[^\s]*)?/,
  dateRange: /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4})\s*[-–—to]+\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*)?(\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow)/i,
  gpa: /(?:GPA|G\.P\.A\.?|Grade)[\s:]*(\d\.\d{1,2})(?:\s*\/\s*4(?:\.0)?)?/i,
  degree: /(?:Bachelor|Master|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|MBA|Associate|Diploma)/i,
  bulletPoint: /^[\s]*[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/,
}

/**
 * Parse raw resume text into structured sections
 */
export function parseResume(rawText: string): ParsedResume {
  console.log('[parseResume] Starting parse...')
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean)
  console.log('[parseResume] Found', lines.length, 'lines')
  
  // Extract contact info from the beginning (usually first few lines)
  console.log('[parseResume] Extracting contact info...')
  const contact = extractContactInfo(lines.slice(0, 15).join('\n'))
  console.log('[parseResume] Contact extracted:', contact)
  
  // Identify and split sections
  console.log('[parseResume] Identifying sections...')
  const sections = identifySections(lines)
  console.log('[parseResume] Found sections:', Object.keys(sections))
  
  // Parse each section type
  console.log('[parseResume] Parsing summary...')
  const summary = sections.summary ? cleanText(sections.summary) : null
  
  console.log('[parseResume] Parsing experience...')
  const experience = sections.experience ? parseExperience(sections.experience) : []
  console.log('[parseResume] Parsed', experience.length, 'experience entries')
  
  console.log('[parseResume] Parsing education...')
  const education = sections.education ? parseEducation(sections.education) : []
  console.log('[parseResume] Parsed', education.length, 'education entries')
  
  console.log('[parseResume] Parsing skills...')
  const skills = sections.skills ? parseSkills(sections.skills) : emptySkills()
  console.log('[parseResume] Parsed', skills.all.length, 'skills')
  
  console.log('[parseResume] Parsing certifications...')
  const certifications = sections.certifications ? parseBulletList(sections.certifications) : []
  
  console.log('[parseResume] Parsing projects...')
  const projects = sections.projects ? parseProjects(sections.projects) : []
  
  console.log('[parseResume] Parsing languages...')
  const languages = sections.languages ? parseBulletList(sections.languages) : []
  
  console.log('[parseResume] Parsing awards...')
  const awards = sections.awards ? parseBulletList(sections.awards) : []
  
  // Keep track of unparsed sections
  const rawSections: Record<string, string> = {}
  for (const [key, value] of Object.entries(sections)) {
    if (!['summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'awards'].includes(key)) {
      rawSections[key] = value
    }
  }
  
  console.log('[parseResume] Parse complete!')
  return {
    contact,
    summary,
    experience,
    education,
    skills,
    certifications,
    projects,
    languages,
    awards,
    rawSections,
  }
}

/**
 * Extract contact information from text
 */
function extractContactInfo(text: string): ContactInfo {
  const emailMatch = text.match(PATTERNS.email)
  const phoneMatch = text.match(PATTERNS.phone)
  const linkedinMatch = text.match(PATTERNS.linkedin)
  const githubMatch = text.match(PATTERNS.github)
  
  // Try to extract name from first line
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let name: string | null = null
  
  if (lines.length > 0) {
    const firstLine = lines[0]
    // Name is usually the first line, not containing email/phone/urls
    if (!PATTERNS.email.test(firstLine) && 
        !PATTERNS.phone.test(firstLine) && 
        !firstLine.includes('http') &&
        firstLine.length < 60) {
      name = firstLine
    }
  }
  
  // Try to find location (city, state or city, country pattern)
  const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/)
  
  return {
    name,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : null,
    github: githubMatch ? `github.com/${githubMatch[1]}` : null,
    website: null, // More complex to extract reliably
    location: locationMatch ? locationMatch[0] : null,
  }
}

/**
 * Identify sections in the resume text
 */
function identifySections(lines: string[]): Record<string, string> {
  const sections: Record<string, string> = {}
  let currentSection: string | null = null
  let currentContent: string[] = []
  
  for (const line of lines) {
    // Check if this line is a section header
    let foundSection: string | null = null
    for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        foundSection = sectionName
        break
      }
    }
    
    if (foundSection) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n')
      }
      currentSection = foundSection
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }
  
  // Save the last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n')
  }
  
  return sections
}

/**
 * Parse experience section into structured entries
 */
function parseExperience(text: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  const lines = text.split('\n')
  
  let currentEntry: Partial<ExperienceEntry> | null = null
  let currentHighlights: string[] = []
  let descriptionLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check for date range - indicates new entry
    const dateMatch = trimmed.match(PATTERNS.dateRange)
    
    if (dateMatch) {
      // Save previous entry
      if (currentEntry) {
        currentEntry.highlights = currentHighlights
        currentEntry.description = descriptionLines.join('\n')
        entries.push(currentEntry as ExperienceEntry)
      }
      
      // Extract dates safely - dateMatch can have undefined groups
      const startMonth = dateMatch[1] || ''
      const startYear = dateMatch[2] || ''
      const endMonth = dateMatch[3] || ''
      const endYear = dateMatch[4] || ''
      
      // Start new entry
      currentEntry = {
        title: null,
        company: null,
        location: null,
        startDate: `${startMonth} ${startYear}`.trim() || null,
        endDate: `${endMonth} ${endYear}`.trim() || null,
        current: /present|current|now/i.test(endYear),
        description: '',
        highlights: [],
      }
      currentHighlights = []
      descriptionLines = []
      
      // Try to extract title and company from lines around the date
      const beforeDate = trimmed.split(PATTERNS.dateRange)[0].trim()
      if (beforeDate) {
        // Check if it's "Title at Company" or "Title | Company" pattern
        const titleCompanyMatch = beforeDate.match(/^(.+?)(?:\s+at\s+|\s*[|,]\s*)(.+)$/i)
        if (titleCompanyMatch) {
          currentEntry.title = titleCompanyMatch[1].trim()
          currentEntry.company = titleCompanyMatch[2].trim()
        } else {
          currentEntry.title = beforeDate
        }
      }
    } else if (currentEntry) {
      // It's a bullet point or description
      if (PATTERNS.bulletPoint.test(trimmed)) {
        currentHighlights.push(trimmed.replace(PATTERNS.bulletPoint, ''))
      } else {
        // Could be company name or location if we don't have it yet
        if (!currentEntry.company && !currentEntry.title) {
          currentEntry.title = trimmed
        } else if (!currentEntry.company) {
          currentEntry.company = trimmed
        } else {
          descriptionLines.push(trimmed)
        }
      }
    }
  }
  
  // Save last entry
  if (currentEntry) {
    currentEntry.highlights = currentHighlights
    currentEntry.description = descriptionLines.join('\n')
    entries.push(currentEntry as ExperienceEntry)
  }
  
  return entries
}

/**
 * Parse education section into structured entries
 */
function parseEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = []
  const lines = text.split('\n')
  
  let currentEntry: Partial<EducationEntry> | null = null
  let currentHighlights: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check for degree keyword or date range
    const hasDegree = PATTERNS.degree.test(trimmed)
    const dateMatch = trimmed.match(PATTERNS.dateRange)
    const gpaMatch = trimmed.match(PATTERNS.gpa)
    
    if (hasDegree || dateMatch) {
      // Save previous entry
      if (currentEntry) {
        currentEntry.highlights = currentHighlights
        entries.push(currentEntry as EducationEntry)
      }
      
      // Extract dates safely - dateMatch can have undefined groups
      const startMonth = dateMatch ? dateMatch[1] || '' : ''
      const startYear = dateMatch ? dateMatch[2] || '' : ''
      const endMonth = dateMatch ? dateMatch[3] || '' : ''
      const endYear = dateMatch ? dateMatch[4] || '' : ''
      
      currentEntry = {
        degree: null,
        field: null,
        institution: null,
        location: null,
        startDate: `${startMonth} ${startYear}`.trim() || null,
        endDate: `${endMonth} ${endYear}`.trim() || null,
        gpa: null,
        highlights: [],
      }
      currentHighlights = []
      
      // Extract degree
      const degreeMatch = trimmed.match(PATTERNS.degree)
      if (degreeMatch) {
        currentEntry.degree = trimmed.split(/,|\sin\s|\sat\s/)[0].trim()
        // Try to extract field of study
        const fieldMatch = trimmed.match(/(?:in|of)\s+([^,|]+)/i)
        if (fieldMatch) {
          currentEntry.field = fieldMatch[1].trim()
        }
      }
    } else if (currentEntry) {
      if (gpaMatch) {
        currentEntry.gpa = gpaMatch[1]
      } else if (PATTERNS.bulletPoint.test(trimmed)) {
        currentHighlights.push(trimmed.replace(PATTERNS.bulletPoint, ''))
      } else if (!currentEntry.institution) {
        currentEntry.institution = trimmed
      } else if (!currentEntry.location) {
        currentEntry.location = trimmed
      }
    }
  }
  
  // Save last entry
  if (currentEntry) {
    currentEntry.highlights = currentHighlights
    entries.push(currentEntry as EducationEntry)
  }
  
  return entries
}

/**
 * Parse skills section
 */
function parseSkills(text: string): SkillsSection {
  const skills: SkillsSection = emptySkills()
  
  // Common technical skill keywords for categorization
  const techPatterns = {
    languages: /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|R|MATLAB|Perl|Shell|Bash|SQL|HTML|CSS)\b/gi,
    frameworks: /\b(React|Angular|Vue|Next\.?js|Node\.?js|Express|Django|Flask|Spring|Rails|Laravel|\.NET|ASP\.NET|FastAPI|NestJS|Svelte|Nuxt)\b/gi,
    tools: /\b(Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|CircleCI|GitHub\s*Actions?|Terraform|Ansible|Grafana|Prometheus|Jira|Confluence|Slack|Figma|Postman)\b/gi,
  }
  
  const lines = text.split('\n')
  
  for (const line of lines) {
    const trimmed = line.replace(PATTERNS.bulletPoint, '').trim()
    if (!trimmed) continue
    
    // Check for category headers like "Languages:" or "Tools:"
    const categoryMatch = trimmed.match(/^(programming\s*languages?|languages?|frameworks?|tools?|technologies|databases?|soft\s*skills?)\s*:?\s*(.*)$/i)
    
    if (categoryMatch) {
      const category = categoryMatch[1].toLowerCase()
      const skillList = categoryMatch[2] || ''
      const skillItems = skillList.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
      
      if (category.includes('language')) {
        skills.languages.push(...skillItems)
      } else if (category.includes('framework')) {
        skills.frameworks.push(...skillItems)
      } else if (category.includes('tool')) {
        skills.tools.push(...skillItems)
      } else if (category.includes('soft')) {
        skills.soft.push(...skillItems)
      } else {
        skills.technical.push(...skillItems)
      }
    } else {
      // Parse as comma-separated list
      const skillItems = trimmed.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
      
      for (const skill of skillItems) {
        skills.all.push(skill)
        
        // Categorize automatically
        if (techPatterns.languages.test(skill)) {
          skills.languages.push(skill)
        } else if (techPatterns.frameworks.test(skill)) {
          skills.frameworks.push(skill)
        } else if (techPatterns.tools.test(skill)) {
          skills.tools.push(skill)
        } else {
          skills.technical.push(skill)
        }
      }
    }
  }
  
  // Deduplicate
  skills.all = [...new Set(skills.all)]
  skills.technical = [...new Set(skills.technical)]
  skills.languages = [...new Set(skills.languages)]
  skills.frameworks = [...new Set(skills.frameworks)]
  skills.tools = [...new Set(skills.tools)]
  skills.soft = [...new Set(skills.soft)]
  
  return skills
}

/**
 * Parse projects section
 */
function parseProjects(text: string): ProjectEntry[] {
  const projects: ProjectEntry[] = []
  const lines = text.split('\n')
  
  let currentProject: Partial<ProjectEntry> | null = null
  let currentHighlights: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check if this starts a new project (usually a title line, not a bullet)
    if (!PATTERNS.bulletPoint.test(trimmed) && trimmed.length < 100) {
      // Save previous project
      if (currentProject) {
        currentProject.highlights = currentHighlights
        projects.push(currentProject as ProjectEntry)
      }
      
      // Extract URL if present
      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/)
      
      currentProject = {
        name: trimmed.replace(/https?:\/\/[^\s]+/, '').trim(),
        description: '',
        technologies: [],
        url: urlMatch ? urlMatch[0] : null,
        highlights: [],
      }
      currentHighlights = []
    } else if (currentProject) {
      const cleanLine = trimmed.replace(PATTERNS.bulletPoint, '')
      
      // Check for tech stack pattern
      if (/^(?:technologies?|tech\s*stack|built\s*with|using)\s*:/i.test(cleanLine)) {
        const techPart = cleanLine.split(':')[1] || ''
        currentProject.technologies = techPart.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
      } else {
        currentHighlights.push(cleanLine)
      }
    }
  }
  
  // Save last project
  if (currentProject) {
    currentProject.highlights = currentHighlights
    projects.push(currentProject as ProjectEntry)
  }
  
  return projects
}

/**
 * Parse a simple bullet list section
 */
function parseBulletList(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.replace(PATTERNS.bulletPoint, '').trim())
    .filter(Boolean)
}

/**
 * Clean up text
 */
function cleanText(text: string): string {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Create empty skills section
 */
function emptySkills(): SkillsSection {
  return {
    technical: [],
    soft: [],
    tools: [],
    languages: [],
    frameworks: [],
    all: [],
  }
}
