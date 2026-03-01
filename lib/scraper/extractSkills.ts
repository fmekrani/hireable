import { normalizeSkillsFromText, filterTechStack } from '@/lib/skills/canonicalSkills'

export interface ExtractedSkills {
  requiredSkills: string[]
  preferredSkills: string[]
  qualities: string[]
  techStack: string[]
}

const REQUIRED_KEYS = [
  'requirements',
  'qualifications',
  "what you’ll need",
  "what you'll need",
  'what you need',
  'must have',
  'required',
  'minimum qualifications',
]

const PREFERRED_KEYS = [
  'preferred',
  'nice to have',
  'bonus',
  'preferred qualifications',
]

const QUALITIES_KEYS = ['soft skills', 'qualities', 'traits', 'who you are']

const SKILL_WHITELIST = new Set([
  'SQL', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
  'Scala', 'Kotlin', 'PHP', 'Ruby', 'R', 'MATLAB', 'Swift',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'Spark', 'BigQuery',
  'Tableau', 'Looker', 'Power BI', 'Qlik', 'Microstrategy',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
  'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'Analytics',
  'Statistics', 'Probability', 'ETL', 'Data Warehouse', 'Data Lakes',
  'Excel', 'Git', 'JIRA', 'Confluence', 'Salesforce', 'SAP', 'Oracle', 'SQL Server',
  'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring',
  'Linux', 'Unix', 'Windows', 'Mac',
  'Project Management', 'Agile', 'Scrum', 'Communication', 'Leadership',
  'Problem Solving', 'Critical Thinking', 'Teamwork', 'Collaboration',
  'Data Analysis', 'Visualization', 'Storytelling', 'Presentation',
])

const QUALITY_WHITELIST = new Set([
  'Project Management',
  'Agile',
  'Scrum',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Critical Thinking',
  'Teamwork',
  'Collaboration',
  'Storytelling',
  'Presentation',
])

function findSectionText(sections: Record<string, string>, keys: string[]) {
  for (const key of Object.keys(sections)) {
    if (keys.some((match) => key.includes(match))) {
      return sections[key]
    }
  }
  return ''
}

export function extractSkills(input: {
  description: string
  sections: Record<string, string>
}): ExtractedSkills {
  const requiredText = findSectionText(input.sections, REQUIRED_KEYS)
  const preferredText = findSectionText(input.sections, PREFERRED_KEYS)
  const qualitiesText = findSectionText(input.sections, QUALITIES_KEYS)

  const requiredSource = requiredText && requiredText.length > 20
    ? requiredText
    : input.description

  const requiredSkills = normalizeSkillsFromText(requiredSource || '', SKILL_WHITELIST)
  const preferredSkills = normalizeSkillsFromText(preferredText || '', SKILL_WHITELIST)
  const qualities = normalizeSkillsFromText(qualitiesText || '', QUALITY_WHITELIST)
  const techStack = filterTechStack(requiredSkills)

  return {
    requiredSkills,
    preferredSkills,
    qualities,
    techStack,
  }
}
