/**
 * Accuracy-Focused Matching & Scoring Engine
 *
 * Produces:
 * 1. overallScore (0-100) with guardrails
 * 2. Skill match breakdown
 * 3. Skills to develop (prioritized, no generic soft skills unless required)
 * 4. Human-readable reasoning
 *
 * Core principles:
 * - Soft skills don't inflate hard skill gaps
 * - Role-aware scoring
 * - Hard caps for missing critical skills
 * - Evidence-based confidence
 * - Transparent breakdown
 */

import {
  canonicalizeSkill,
  isSoftSkill,
  matchSkills,
  assessSkillMatch,
  inferRoleFamily,
  getCoreSkillsForRole,
  type SkillCategory,
} from './skillCanonication';

import { buildResumeEvidenceMap, getSkillConfidence, getHardSkills, type ResumeEvidenceMap } from './resumeEvidenceModel';

import type { ResumeParsed } from '../resume/parse';

// ===== TYPES =====

export interface SkillMatchResult {
  skillName: string;
  type: 'exact' | 'near' | 'none';
  confidence: number;
  evidenceTier?: 1 | 2 | 3;
  isSoft: boolean;
}

export interface ScoreBreakdown {
  requiredMatchScore: number; // Weight: 40%
  coreRoleScore: number; // Weight: 25%
  preferredMatchScore: number; // Weight: 15%
  evidenceBonus: number; // Weight: 10%
  penaltyHardMissing: number; // Applied after weighting
  penaltyRoleMismatch: number; // Applied after weighting
  explanation: string;
}

export interface ScoringResult {
  overallScore: number; // 0-100
  breakdown: ScoreBreakdown;
  matchedSkills: string[];
  nearMatchSkills: string[];
  missingRequiredHardSkills: string[];
  missingPreferredSkills: string[];
  skillsToDevelop: SkillToDevelop[];
}

export interface SkillToDevelop {
  skillName: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  isRequired: boolean;
  isSoft: boolean;
  estimatedWeeks: number;
}

// ===== SCORING ENGINE =====

/**
 * Main scoring function: produces overallScore and detailed breakdown
 */
export function scoreResumeToJob(
  resume: ResumeParsed,
  jobTitle: string,
  requiredSkills: string[],
  preferredSkills: string[] = [],
  jobDescription: string = ''
): ScoringResult {
  // Canonicalize all skills
  const canonicalRequired = requiredSkills.map(canonicalizeSkill);
  const canonicalPreferred = preferredSkills.map(canonicalizeSkill);

  // Use resume skills directly (simpler model for current data)
  const resumeSkillsAll = (resume.skills || []).map(canonicalizeSkill);

  // Infer role family
  const roleFamily = inferRoleFamily(jobTitle, canonicalRequired);
  const coreSkillsForRole = getCoreSkillsForRole(roleFamily);

  // Match skills
  const requiredMatches = matchSkillListsSimple(resumeSkillsAll, canonicalRequired);
  const preferredMatches = matchSkillListsSimple(resumeSkillsAll, canonicalPreferred);

  // Extract missing skills
  const missingRequired = canonicalRequired.filter((skill) => !requiredMatches.some((m) => m.skillName === skill && m.type !== 'none'));
  const missingPreferred = canonicalPreferred.filter((skill) => !preferredMatches.some((m) => m.skillName === skill && m.type !== 'none'));

  // Separate hard vs soft in missing
  const missingRequiredHardSkills = missingRequired.filter((s) => !isSoftSkill(s));
  const missingRequiredSoftSkills = missingRequired.filter((s) => isSoftSkill(s));

  // Create minimal evidence map from ResumeParsed (simpler than ParsedResume)
  const evidence: ResumeEvidenceMap = {
    allSkills: resumeSkillsAll,
    skillsByTier: {
      tier3: resumeSkillsAll.filter((s) => !isSoftSkill(s)).slice(0, Math.ceil(resumeSkillsAll.length / 3)),
      tier2: resumeSkillsAll.slice(Math.ceil(resumeSkillsAll.length / 3), Math.ceil((2 * resumeSkillsAll.length) / 3)),
      tier1: resumeSkillsAll.slice(Math.ceil((2 * resumeSkillsAll.length) / 3)),
    },
    evidenceMap: new Map(),
    softSkillsFound: new Set(resumeSkillsAll.filter((s) => isSoftSkill(s))),
    hardSkillsFound: new Set(resumeSkillsAll.filter((s) => !isSoftSkill(s))),
  };

  // Compute score components
  const breakdown = computeScoreBreakdown(
    requiredMatches,
    preferredMatches,
    missingRequiredHardSkills,
    missingRequiredSoftSkills,
    coreSkillsForRole,
    resumeSkillsAll,
    roleFamily,
    evidence
  );

  const overallScore = Math.round(
    breakdown.requiredMatchScore * 0.4 +
      breakdown.coreRoleScore * 0.25 +
      breakdown.preferredMatchScore * 0.15 +
      breakdown.evidenceBonus * 0.1 -
      breakdown.penaltyHardMissing -
      breakdown.penaltyRoleMismatch
  );

  // Clamp score
  const clampedScore = Math.max(0, Math.min(100, overallScore));

  // Generate skills to develop
  const skillsToDevelop = generateSkillsToDevelop(
    missingRequired,
    missingPreferred,
    missingRequiredSoftSkills,
    evidence,
    roleFamily,
    resumeSkillsAll.length > 0
  );

  return {
    overallScore: clampedScore,
    breakdown,
    matchedSkills: requiredMatches.filter((m) => m.type === 'exact').map((m) => m.skillName),
    nearMatchSkills: requiredMatches.filter((m) => m.type === 'near').map((m) => m.skillName),
    missingRequiredHardSkills,
    missingPreferredSkills: missingPreferred,
    skillsToDevelop,
  };
}

/**
 * Match two skill lists with canonicalization and category matching
 */
function matchSkillListsSimple(resumeSkills: string[], jobSkills: string[]): SkillMatchResult[] {
  return jobSkills.map((jobSkill) => {
    // Find best match in resume skills
    let bestMatch: SkillMatchResult = {
      skillName: jobSkill,
      type: 'none',
      confidence: 0,
      isSoft: isSoftSkill(jobSkill),
    };

    resumeSkills.forEach((resumeSkill) => {
      const assessment = assessSkillMatch(resumeSkill, jobSkill);
      if (assessment.confidence > bestMatch.confidence) {
        bestMatch = {
          skillName: jobSkill,
          type: assessment.type,
          confidence: assessment.confidence,
          isSoft: isSoftSkill(jobSkill),
        };
      }
    });

    return bestMatch;
  });
}

/**
 * Match two skill lists with canonicalization and category matching (legacy signature)
 */
function matchSkillLists(resumeSkills: string[], jobSkills: string[], evidence: ResumeEvidenceMap): SkillMatchResult[] {
  return matchSkillListsSimple(resumeSkills, jobSkills);
}

/**
 * Compute score breakdown with components
 */
function computeScoreBreakdown(
  requiredMatches: SkillMatchResult[],
  preferredMatches: SkillMatchResult[],
  missingHard: string[],
  missingSoft: string[],
  coreSkills: string[],
  resumeHardSkills: string[],
  roleFamily: string,
  evidence: ResumeEvidenceMap
): ScoreBreakdown {
  // Required match score (0-100): exact=10, near=6 per skill, max length weighted
  const exactRequired = requiredMatches.filter((m) => m.type === 'exact').length;
  const nearRequired = requiredMatches.filter((m) => m.type === 'near').length;
  const totalRequired = requiredMatches.length;

  let requiredMatchScore = 0;
  if (totalRequired > 0) {
    requiredMatchScore = ((exactRequired * 10 + nearRequired * 6) / (totalRequired * 10)) * 100;
  } else {
    requiredMatchScore = 100; // No requirements = perfect
  }

  // Core role score (0-100): based on essential skills for role
  let coreRoleScore = 0;
  if (coreSkills.length > 0) {
    const matchedCore = coreSkills.filter((skill) => evidence.allSkills.some((resumeSkill) => matchSkills(resumeSkill, skill) !== 'none')).length;
    coreRoleScore = (matchedCore / coreSkills.length) * 100;
  } else {
    coreRoleScore = 50; // Unknown role, neutral score
  }

  // Preferred match score (0-100)
  let preferredMatchScore = 0;
  if (preferredMatches.length > 0) {
    const exactPreferred = preferredMatches.filter((m) => m.type === 'exact').length;
    const nearPreferred = preferredMatches.filter((m) => m.type === 'near').length;
    preferredMatchScore = ((exactPreferred * 10 + nearPreferred * 6) / (preferredMatches.length * 10)) * 100;
  } else {
    preferredMatchScore = 50; // No preferences = neutral
  }

  // Evidence bonus (0-10): scale up by tier 3 skills
  const tier3Skills = evidence.skillsByTier.tier3.filter((s) => !isSoftSkill(s)).length;
  const evidenceBonus = Math.min(10, (tier3Skills / Math.max(1, evidence.hardSkillsFound.size)) * 10);

  // Hard penalty: missing critical hard skills
  let penaltyHardMissing = 0;
  if (missingHard.length >= 2) {
    penaltyHardMissing = 20; // Two or more hard gaps = -20
  } else if (missingHard.length === 1) {
    // Check if it's truly critical for role
    const isCritical = coreSkills.includes(missingHard[0]);
    penaltyHardMissing = isCritical ? 15 : 5;
  }

  // Role mismatch penalty
  let penaltyRoleMismatch = 0;
  if (resumeHardSkills.length === 0 && roleFamily !== 'general') {
    penaltyRoleMismatch = 20; // No domain skills + strong role requirement
  } else if (roleFamily !== 'general' && !resumeHardSkills.some((s) => coreSkills.includes(canonicalizeSkill(s)))) {
    penaltyRoleMismatch = 10; // Missing core skills for stated role
  }

  const explanation = buildExplanation(
    exactRequired,
    nearRequired,
    totalRequired,
    missingHard,
    missingSoft,
    requiredMatchScore,
    coreRoleScore,
    roleFamily
  );

  return {
    requiredMatchScore: Math.round(requiredMatchScore),
    coreRoleScore: Math.round(coreRoleScore),
    preferredMatchScore: Math.round(preferredMatchScore),
    evidenceBonus: Math.round(evidenceBonus),
    penaltyHardMissing,
    penaltyRoleMismatch,
    explanation,
  };
}

/**
 * Generate skills to develop list (no generic soft skills unless explicitly required)
 */
function generateSkillsToDevelop(
  missingRequired: string[],
  missingPreferred: string[],
  missingSoftRequired: string[],
  evidence: ResumeEvidenceMap,
  roleFamily: string,
  hasHardSkills: boolean
): SkillToDevelop[] {
  const result: SkillToDevelop[] = [];

  // Add missing required hard skills (high priority)
  const missingHard = missingRequired.filter((s) => !isSoftSkill(s));
  missingHard.forEach((skill) => {
    result.push({
      skillName: skill,
      priority: 'high',
      reason: `Required for this ${roleFamily} role`,
      isRequired: true,
      isSoft: false,
      estimatedWeeks: estimateWeeksToLearn(skill),
    });
  });

  // Add missing preferred hard skills (medium priority)
  const missingPrefferredHard = missingPreferred.filter((s) => !isSoftSkill(s));
  missingPrefferredHard.forEach((skill) => {
    result.push({
      skillName: skill,
      priority: 'medium',
      reason: `Preferred skill for this role`,
      isRequired: false,
      isSoft: false,
      estimatedWeeks: estimateWeeksToLearn(skill),
    });
  });

  // Only include soft skills if:
  // 1. They were explicitly required in the job
  // 2. All hard skills are covered
  if (missingSoftRequired.length > 0 && missingHard.length === 0) {
    missingSoftRequired.slice(0, 1).forEach((skill) => {
      // Only show top 1 soft skill
      result.push({
        skillName: skill,
        priority: 'low',
        reason: `Soft skill mentioned in job requirements`,
        isRequired: true,
        isSoft: true,
        estimatedWeeks: 2, // Soft skills typically faster
      });
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 5 most impactful skills
  return result.slice(0, 5);
}

/**
 * Build human-readable explanation
 */
function buildExplanation(
  exactRequired: number,
  nearRequired: number,
  totalRequired: number,
  missingHard: string[],
  missingSoft: string[],
  reqScore: number,
  coreScore: number,
  roleFamily: string
): string {
  const parts: string[] = [];

  // Required skills
  if (totalRequired > 0) {
    parts.push(`${exactRequired}/${totalRequired} required skills matched exactly`);
    if (nearRequired > 0) parts.push(`${nearRequired} via similar skills`);
  }

  // Missing hard skills
  if (missingHard.length > 0) {
    parts.push(`Missing ${missingHard.length} hard skill${missingHard.length !== 1 ? 's' : ''}: ${missingHard.slice(0, 2).join(', ')}`);
  }

  // Soft skills note
  if (missingSoft.length > 0) {
    parts.push(`Soft skill gaps exist but less critical than hard skills`);
  }

  // Core role assessment
  if (roleFamily !== 'general') {
    if (coreScore >= 80) {
      parts.push(`Strong foundation for ${roleFamily} role`);
    } else if (coreScore >= 50) {
      parts.push(`Partial foundation for ${roleFamily} role`);
    } else {
      parts.push(`Limited experience in core ${roleFamily} skills`);
    }
  }

  return parts.join('. ');
}

/**
 * Estimate weeks to learn a skill (simplified)
 */
function estimateWeeksToLearn(skill: string): number {
  const canonical = canonicalizeSkill(skill).toLowerCase();

  // Simple heuristic based on skill complexity
  const complexityMap: Record<string, number> = {
    // Very quick (1-2 weeks)
    'git': 1,
    'github': 1,
    'gitlab': 1,
    'jira': 2,
    'confluence': 2,
    'agile': 2,
    'scrum': 2,

    // Quick (2-4 weeks)
    'html': 2,
    'css': 2,
    'sql': 3,
    'rest': 2,
    'graphql': 3,
    'docker': 3,
    'jenkins': 4,
    'circleci': 3,

    // Medium (4-8 weeks)
    'javascript': 6,
    'typescript': 5,
    'python': 6,
    'react': 6,
    'vue': 5,
    'angular': 7,
    'nodejs': 6,
    'express': 5,
    'postgresql': 6,
    'mongodb': 5,
    'kubernetes': 8,
    'terraform': 6,
    'aws': 6,
    'gcp': 6,

    // Hard (8-16 weeks)
    'java': 12,
    'go': 10,
    'rust': 14,
    'machine learning': 12,
    'tensorflow': 12,
    'pytorch': 12,
    'apache spark': 10,
    'hadoop': 12,
    'distributed systems': 16,

    // Specialized (16+ weeks)
    'nlp': 20,
    'computer vision': 20,
    'deep learning': 16,
  };

  return complexityMap[canonical] || 8; // Default: 2 months
}
