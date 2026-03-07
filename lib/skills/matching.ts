/**
 * Resume-to-Job Skill Matching
 * 
 * Compares skills extracted from resume against job skill requirements.
 * Both use canonical skill format from /lib/skills/canonicalSkills.ts
 * 
 * Used by:
 * - Matching/analysis layer
 * - Dashboard to show skill gap
 */

import { getSkillOverlap } from '@/lib/skills/canonicalSkills'

export interface SkillGap {
  matched: string[] // Skills on resume that job requires
  missing: string[] // Skills job requires that resume doesn't have
  matchPercentage: number // 0-100
  recommendation?: string // Human-readable summary
}

/**
 * Analyze skill gap between resume and job posting
 */
export function analyzeSkillGap(
  resumeSkills: string[],
  jobRequiredSkills: string[],
  jobPreferredSkills: string[] = []
): SkillGap {
  // Match against required skills only for scoring
  const overlap = getSkillOverlap(resumeSkills, jobRequiredSkills)

  // Generate recommendation
  let recommendation = ''
  if (overlap.matchPercentage === 100) {
    recommendation = 'You have all required skills!'
  } else if (overlap.matchPercentage >= 75) {
    recommendation = 'You have most required skills. Consider learning the missing ones.'
  } else if (overlap.matchPercentage >= 50) {
    recommendation = 'You have about half the required skills. Good foundation to build on.'
  } else if (overlap.matchPercentage > 0) {
    recommendation = 'You have some relevant skills but would benefit significantly from learning more.'
  } else {
    recommendation = 'No overlap with required skills. This might be a big learning curve.'
  }

  return {
    matched: overlap.matched,
    missing: overlap.missing,
    matchPercentage: overlap.matchPercentage,
    recommendation,
  }
}

/**
 * Get weeks of study estimated to learn missing skills
 * Very rough estimate: ~1 week per skill for intermediate learner
 */
export function estimateWeeksToLearn(missingSkills: string[]): number {
  // Simple heuristic: 1 week per skill + 2 weeks for integration/practice
  return Math.max(2, Math.ceil(missingSkills.length * 1.5))
}

/**
 * Combine required and preferred skill assessment
 */
export interface FullSkillAssessment extends SkillGap {
  preferred: {
    matched: string[]
    missing: string[]
  }
  estimatedWeeksToLearn: number
  overallRecommendation: string
}

export function fullSkillAssessment(
  resumeSkills: string[],
  jobRequiredSkills: string[],
  jobPreferredSkills: string[] = []
): FullSkillAssessment {
  const required = analyzeSkillGap(resumeSkills, jobRequiredSkills)
  const preferredOverlap = getSkillOverlap(resumeSkills, jobPreferredSkills)
  const weeksToLearn = estimateWeeksToLearn(required.missing)

  let overallRecommendation = ''
  if (required.matchPercentage === 100) {
    overallRecommendation = `Perfect match! You have all ${jobRequiredSkills.length} required skills.`
  } else {
    const gapCount = required.missing.length
    overallRecommendation =
      `You're missing ${gapCount} skill${gapCount !== 1 ? 's' : ''}. ` +
      `Estimate ${weeksToLearn} weeks of focused learning to close the gap.`
  }

  return {
    ...required,
    preferred: {
      matched: preferredOverlap.matched,
      missing: preferredOverlap.missing,
    },
    estimatedWeeksToLearn: weeksToLearn,
    overallRecommendation,
  }
}
