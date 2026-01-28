/**
 * Feature Extraction Test & Validation
 * Run this to test feature extraction with mock data
 */

import {
  extractResumeFeatures,
  extractJobFeatures,
  getMatchedSkills,
  getMissingSkills,
  normalizeEducationLevel,
  normalizeSeniorityLevel,
} from './featureExtractor'

// Test data
const testResume = {
  skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  yearsOfExperience: 3,
  educationLevel: "Bachelor's",
  jobTitles: ['Junior Developer', 'Mid-level Developer'],
}

const testJob = {
  requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL'],
  requiredExperienceYears: 5,
  seniorityLevel: 'Senior',
  jobTitle: 'Senior Full-Stack Developer',
}

export function testFeatureExtraction() {
  console.log('=== Feature Extraction Test ===\n')

  // Test resume features
  console.log('Resume Features:')
  const resumeFeatures = extractResumeFeatures(
    testResume.skills,
    testResume.yearsOfExperience,
    testResume.educationLevel,
    testResume.jobTitles
  )
  console.log('- Skill Count:', resumeFeatures.skillCount)
  console.log('- Years of Experience:', resumeFeatures.yearsOfExperience)
  console.log('- Education Level:', resumeFeatures.educationLevel)
  console.log('- Skill Vector Length:', resumeFeatures.skillVector.length)
  console.log('- Skills Found in Vector:', resumeFeatures.skillVector.filter(x => x === 1).length)

  // Test job features
  console.log('\nJob Features:')
  const jobFeatures = extractJobFeatures(
    testJob.requiredSkills,
    testJob.requiredExperienceYears,
    testJob.seniorityLevel,
    testJob.jobTitle
  )
  console.log('- Required Skill Count:', jobFeatures.requiredSkillCount)
  console.log('- Required Experience Years:', jobFeatures.requiredExperienceYears)
  console.log('- Seniority Score:', jobFeatures.seniority)
  console.log('- Skill Vector Length:', jobFeatures.skillVector.length)
  console.log('- Skills Found in Vector:', jobFeatures.skillVector.filter(x => x === 1).length)

  // Test skill matching
  console.log('\nSkill Matching:')
  const matched = getMatchedSkills(testResume.skills, testJob.requiredSkills)
  console.log('- Matched Skills:', matched)
  console.log('- Matched Count:', matched.length)

  const missing = getMissingSkills(testResume.skills, testJob.requiredSkills)
  console.log('- Missing Skills:', missing)
  console.log('- Missing Count:', missing.length)

  // Test normalization
  console.log('\nNormalization:')
  console.log('- Education "B.S" ->', normalizeEducationLevel('B.S'))
  console.log('- Education "Masters" ->', normalizeEducationLevel('Masters'))
  console.log('- Seniority "Sr Developer" ->', normalizeSeniorityLevel('Sr Developer'))
  console.log('- Seniority "Entry Level" ->', normalizeSeniorityLevel('Entry Level'))

  console.log('\n✅ Feature extraction tests completed!')
}

// Run tests
if (typeof window === 'undefined') {
  // Running in Node.js
  testFeatureExtraction()
}
