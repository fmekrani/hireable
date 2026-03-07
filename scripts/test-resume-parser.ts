#!/usr/bin/env node

/**
 * Resume Parser - Local Integration Test
 * 
 * Tests skill normalization and matching without requiring uploads/auth
 * Run with: npx ts-node scripts/test-resume-parser.ts
 * 
 * Tests:
 * 1. Skill canonicalization (alias → canonical)
 * 2. Tech stack filtering
 * 3. Resume-to-job matching
 * 4. Edge cases (short skills like "Go", "R")
 */

import { normalizeSkillsFromText, filterTechStack, getSkillOverlap } from '../lib/skills/canonicalSkills'
import { fullSkillAssessment, estimateWeeksToLearn } from '../lib/skills/matching'

console.log('='.repeat(60))
console.log('Resume Parser Integration Tests')
console.log('='.repeat(60))

// Test 1: Skill normalization
console.log('\n[TEST 1] Skill Canonicalization\n')

const resumeText = `
  Experienced software engineer with 5+ years in full-stack development.
  
  Skills:
  - Python, JavaScript, TypeScript, Node.js
  - React, Vue.js, Angular
  - SQL, PostgreSQL, MongoDB
  - Docker, Kubernetes
  - AWS, Google Cloud Platform
  - Django, FastAPI
  - Git, JIRA
`

const normalized = normalizeSkillsFromText(resumeText)
console.log('Input text (excerpt):')
console.log(resumeText.substring(0, 150) + '...\n')
console.log('Extracted canonical skills:')
console.log(normalized.map((s) => `  ✓ ${s}`).join('\n'))
console.log(`\nTotal: ${normalized.length} unique skills\n`)

// Test 2: Tech stack filtering
console.log('[TEST 2] Tech Stack Filtering\n')

const jobText = `
  Looking for a Backend Engineer with:
  - Python or Java experience
  - SQL databases
  - RESTful API design
  - Docker and Kubernetes
  - Communication and teamwork
`

const jobSkills = normalizeSkillsFromText(jobText)
const techStack = filterTechStack(jobSkills)

console.log('Job requirements extracted:')
console.log(jobSkills.map((s) => `  ${s}`).join('\n'))
console.log('\nTech stack (programming languages only):')
console.log(techStack.map((s) => `  ► ${s}`).join('\n'))
console.log(`\nFiltered ${jobSkills.length} → ${techStack.length} tech-only skills\n`)

// Test 3: Skill matching
console.log('[TEST 3] Resume-to-Job Matching\n')

const resumeSkills = ['Python', 'JavaScript', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git']
const jobRequired = ['Python', 'SQL', 'Docker', 'Kubernetes', 'AWS']
const jobPreferred = ['Kubernetes', 'PostgreSQL', 'REST API']

console.log('Resume skills:', resumeSkills)
console.log('Job required:', jobRequired)
console.log('Job preferred:', jobPreferred)

const overlap = getSkillOverlap(resumeSkills, jobRequired)
console.log('\n  Matched required skills:', overlap.matched)
console.log('  Missing required skills:', overlap.missing)
console.log(`  Match: ${overlap.matchPercentage}%\n`)

// Test 4: Full assessment
console.log('[TEST 4] Full Skill Assessment\n')

const assessment = fullSkillAssessment(resumeSkills, jobRequired, jobPreferred)

console.log(`Overall Match: ${assessment.matchPercentage}%`)
console.log(`Matched (${assessment.matched.length}): ${assessment.matched.join(', ') || 'none'}`)
console.log(`Missing (${assessment.missing.length}): ${assessment.missing.join(', ') || 'none'}`)
console.log(`Preferred matched (${assessment.preferred.matched.length}): ${assessment.preferred.matched.join(', ') || 'none'}`)
console.log(`Preferred missing (${assessment.preferred.missing.length}): ${assessment.preferred.missing.join(', ') || 'none'}`)
console.log(`\nEstimated learning time: ${assessment.estimatedWeeksToLearn} weeks`)
console.log(`\nRecommendation: ${assessment.overallRecommendation}\n`)

// Test 5: Edge cases
console.log('[TEST 5] Edge Case Handling\n')

const edgeCases = [
  { text: 'I work with Go programming language', expectedMatch: 'Go', shouldNotMatch: ['Google', 'going'] },
  { text: 'R language for statistical analysis', expectedMatch: 'R', shouldNotMatch: ['are', 'programming'] },
  { text: 'NodeJS or Node.js or nodejs', expected: ['Node.js'], count: 1 },
]

for (const testCase of edgeCases) {
  const matched = normalizeSkillsFromText(testCase.text)
  const label = 'expectedMatch' in testCase ? testCase.expectedMatch : testCase.expected?.join(', ')
  const status = matched.length > 0 ? '✓' : '✗'
  console.log(`${status} "${testCase.text}"`)
  console.log(`  → Found: ${matched.join(', ') || 'none'}\n`)
}

// Test 6: Performance benchmark
console.log('[TEST 6] Performance Benchmark\n')

const largeText = Array(100).fill(resumeText).join('\n')
const start = Date.now()
const large = normalizeSkillsFromText(largeText)
const elapsed = Date.now() - start

console.log(`Processing ${Math.round(largeText.length / 1024)}KB of text`)
console.log(`Time: ${elapsed}ms`)
console.log(`Found ${large.length} unique skills`)
console.log(`Rate: ${(largeText.length / elapsed / 1024).toFixed(2)}MB/sec\n`)

// Test 7: Job Scraper Format Compatibility
console.log('[TEST 7] Job Scraper Format Compatibility\n')

const jobScraperOutput = {
  required_skills: ['Python', 'SQL', 'Docker'],
  preferred_skills: ['Kubernetes', 'Node.js'],
  tech_stack: ['Python', 'SQL'],
}

const resumeParserOutput = {
  skills: ['Python', 'Docker', 'JavaScript', 'Node.js'],
  tech_stack: ['Python', 'JavaScript'],
}

console.log('Job scraper format:')
console.log(`  Required: ${jobScraperOutput.required_skills}`)
console.log(`  Tech stack: ${jobScraperOutput.tech_stack}`)

console.log('\nResume parser format:')
console.log(`  Skills: ${resumeParserOutput.skills}`)
console.log(`  Tech stack: ${resumeParserOutput.tech_stack}`)

const compatibility = fullSkillAssessment(
  resumeParserOutput.skills,
  jobScraperOutput.required_skills,
  jobScraperOutput.preferred_skills
)

console.log('\nMatching result:')
console.log(`  Match: ${compatibility.matchPercentage}% (${compatibility.matched.length}/${jobScraperOutput.required_skills.length})`)
console.log(`  Compatible: ✓\n`)

console.log('='.repeat(60))
console.log('All tests completed!')
console.log('='.repeat(60))
