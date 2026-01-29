import {
  ResumeFeatures,
  JobFeatures,
} from './types'
import {
  TECH_SKILL_VOCABULARY,
  EDUCATION_LEVELS,
  SENIORITY_LEVELS,
  normalizeSkillName,
} from './skillVocabulary'

export { TECH_SKILL_VOCABULARY }

/**
 * Create a one-hot encoded vector for skills
 */
export function createSkillVector(
  skills: string[],
  vocabulary: string[] = TECH_SKILL_VOCABULARY
): number[] {
  const vector = new Array(vocabulary.length).fill(0)

  const normalizedSkills = skills.map(s => normalizeSkillName(s).toLowerCase())

  vocabulary.forEach((skill, index) => {
    if (normalizedSkills.includes(skill.toLowerCase())) {
      vector[index] = 1
    }
  })

  return vector
}

/**
 * Extract features from resume text
 */
export function extractResumeFeatures(
  skills: string[],
  yearsOfExperience: number,
  educationLevel: string,
  jobTitles: string[] = []
): ResumeFeatures {
  const skillVector = createSkillVector(skills)
  const skillCount = skills.length
  
  // Encode education level
  const educationCode = EDUCATION_LEVELS[educationLevel as keyof typeof EDUCATION_LEVELS] ?? 1

  return {
    skillCount,
    yearsOfExperience: Math.min(yearsOfExperience, 50), // Cap at 50 years
    educationLevel: educationCode,
    skillVector,
    jobTitles,
  }
}

/**
 * Extract features from job posting
 */
export function extractJobFeatures(
  requiredSkills: string[],
  requiredExperienceYears: number,
  seniorityLevel: string,
  jobTitle: string = ''
): JobFeatures {
  const skillVector = createSkillVector(requiredSkills)
  const requiredSkillCount = requiredSkills.length
  
  // Encode seniority level
  const seniorityScore = SENIORITY_LEVELS[seniorityLevel as keyof typeof SENIORITY_LEVELS] ?? 0.5

  return {
    requiredSkillCount,
    requiredExperienceYears: Math.min(requiredExperienceYears, 50),
    seniority: seniorityScore,
    skillVector,
    jobTitle,
  }
}

/**
 * Calculate matched skills between resume and job
 */
export function getMatchedSkills(
  resumeSkills: string[],
  requiredSkills: string[]
): string[] {
  const normalizedResume = resumeSkills.map(s => normalizeSkillName(s).toLowerCase())
  const normalizedRequired = requiredSkills.map(s => normalizeSkillName(s).toLowerCase())

  return normalizedRequired.filter(skill => normalizedResume.includes(skill))
}

/**
 * Calculate missing skills
 */
export function getMissingSkills(
  resumeSkills: string[],
  requiredSkills: string[]
): string[] {
  const normalizedResume = resumeSkills.map(s => normalizeSkillName(s).toLowerCase())
  const normalizedRequired = requiredSkills.map(s => normalizeSkillName(s).toLowerCase())

  return normalizedRequired.filter(skill => !normalizedResume.includes(skill))
}

/**
 * Normalize education level string
 */
export function normalizeEducationLevel(education: string): string {
  const lower = education.toLowerCase().trim()
  
  if (lower.includes('phd') || lower.includes('doctorate')) return 'PhD'
  if (lower.includes("master's") || lower.includes('masters') || lower.includes('m.s') || lower.includes('ms')) return "Master's"
  if (lower.includes("bachelor's") || lower.includes('bachelors') || lower.includes('b.s') || lower.includes('bs')) return "Bachelor's"
  if (lower.includes('associate')) return 'Associate'
  if (lower.includes('high school') || lower.includes('hs') || lower.includes('diploma')) return 'High School'
  
  return "Bachelor's" // Default
}

/**
 * Normalize seniority level string
 */
export function normalizeSeniorityLevel(seniority: string): string {
  const lower = seniority.toLowerCase().trim()
  
  if (lower.includes('principal') || lower.includes('director')) return 'Principal'
  if (lower.includes('staff')) return 'Staff'
  if (lower.includes('senior')) return 'Senior'
  if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level'
  if (lower.includes('junior')) return 'Junior'
  if (lower.includes('entry') || lower.includes('graduate')) return 'Entry Level'
  
  return 'Mid-Level' // Default
}

/**
 * Encode all features into a single input vector
 */
export function encodeAllFeatures(
  resumeFeatures: ResumeFeatures,
  jobFeatures: JobFeatures
): number[] {
  // Normalize numeric features to 0-1 range
  const normalizedResumeExp = resumeFeatures.yearsOfExperience / 50
  const normalizedJobExp = jobFeatures.requiredExperienceYears / 50
  const normalizedResumeSkillCount = resumeFeatures.skillCount / 50
  const normalizedJobSkillCount = jobFeatures.requiredSkillCount / 50
  const normalizedResumeEducation = resumeFeatures.educationLevel / 4

  // Combine all features
  const features = [
    normalizedResumeExp,
    normalizedJobExp,
    normalizedResumeSkillCount,
    normalizedJobSkillCount,
    normalizedResumeEducation,
    jobFeatures.seniority,
    ...resumeFeatures.skillVector,
    ...jobFeatures.skillVector,
  ]

  return features
}
