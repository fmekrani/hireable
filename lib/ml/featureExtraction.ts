import { ResumeParsed } from '../resume/parse';

// Job output type (from Phase 5B)
export type JobOutput = {
  title: string;
  requiredSkills: string[];
  yearsRequired: string;
  seniority: 'Entry' | 'Mid' | 'Senior' | 'Principal';
  domain: 'Frontend' | 'Backend' | 'Full-Stack' | 'DevOps' | 'Data';
  location?: string;
  description: string;
  url: string;
};

// Feature extraction matching training data format (90 features total)
// Structure: 50 resume features + 40 job features
export function extractFeatures(resume: ResumeParsed, job: JobOutput): number[] {
  const features: number[] = [];

  // === RESUME FEATURES (50 features) ===
  
  // 1. Basic resume metrics (5 features)
  features.push(resume.skills.length); // skillCount
  features.push(resume.yearsExperience); // yearsOfExperience
  features.push(educationLevelToNumber(resume.education)); // educationLevel (0-3)
  features.push(seniorityToNumber(resume.seniority)); // seniority (0-1)
  features.push(Math.min(resume.skills.length, 10) / 10); // normalized skill diversity

  // 2. Resume skill vector (40 features) - encode which skills are present
  const resumeSkillVector = createSkillVector(resume.skills);
  features.push(...resumeSkillVector); // 40 features

  // 3. Resume quality metrics (5 features)
  const hasEducation = resume.education ? 1 : 0;
  features.push(hasEducation);
  features.push(Math.min(resume.yearsExperience / 20, 1)); // normalized experience (max 20 years)
  features.push(calculateSkillCoverage(resume.skills)); // skill diversity score
  features.push(seniorityToNumber(resume.seniority)); // seniority normalized (0-1)
  features.push(calculateExperienceTier(resume.yearsExperience)); // experience tier (0-1)

  // === JOB FEATURES (40 features) ===
  
  // 1. Basic job metrics (5 features)
  features.push(job.requiredSkills.length); // requiredSkillCount
  features.push(parseYearsRequired(job.yearsRequired)); // requiredExperienceYears
  features.push(educationLevelForJob(job.description)); // educationRequired estimate
  features.push(seniorityToNumber(job.seniority)); // seniority
  features.push(1.0); // employmentTypeScore (default full-time)

  // 2. Job skill vector (40 features) - encode which skills job requires
  const jobSkillVector = createSkillVector(job.requiredSkills);
  features.push(...jobSkillVector); // 40 features

  // ===== TOTAL: 5 + 40 + 5 + 5 + 40 = 95 features (we need exactly 90)
  // Trim to 90 by removing last 5 redundant features
  return features.slice(0, 90);
}

// Helper: Convert education level to number
function educationLevelToNumber(education?: string): number {
  if (!education) return 0; // No education data
  const map: Record<string, number> = {
    'Bootcamp': 1,
    'Bachelor': 2,
    'Master': 3,
    'PhD': 3,
  };
  return map[education] ?? 0;
}

// Helper: Convert seniority to normalized value
function seniorityToNumber(seniority: string): number {
  const map: Record<string, number> = {
    'Entry': 0.2,
    'Mid': 0.5,
    'Senior': 0.8,
    'Principal': 1.0,
  };
  return map[seniority] ?? 0.5;
}

// Helper: Parse years required from string (e.g., "5-7 years", "3 years")
function parseYearsRequired(yearsRequired: string): number {
  // Extract first number found
  const match = yearsRequired.match(/\d+/);
  if (match) {
    return Math.min(parseInt(match[0]), 20) / 20; // normalize to 0-1 (max 20 years)
  }
  return 0;
}

// Helper: Estimate education level from job description
function educationLevelForJob(description: string): number {
  const desc = description.toLowerCase();
  if (desc.includes('phd') || desc.includes('master')) return 3;
  if (desc.includes('bachelor') || desc.includes('degree')) return 2;
  if (desc.includes('bootcamp') || desc.includes('certification')) return 1;
  return 2; // default to bachelor level
}

// Helper: Calculate skill coverage score (how diverse the skills are)
function calculateSkillCoverage(skills: string[]): number {
  if (skills.length === 0) return 0;
  // Higher score for more skills, max at 10 skills
  return Math.min(skills.length / 10, 1);
}

// Helper: Calculate experience tier (0-1 normalized)
function calculateExperienceTier(years: number): number {
  // 0-2: Entry (0-0.25), 2-5: Mid (0.25-0.5), 5-10: Senior (0.5-0.8), 10+: Principal (0.8-1.0)
  if (years < 2) return years / 8; // 0-0.25
  if (years < 5) return 0.25 + (years - 2) / 12; // 0.25-0.5
  if (years < 10) return 0.5 + (years - 5) / 25; // 0.5-0.8
  return Math.min(0.8 + (years - 10) / 50, 1); // 0.8-1.0
}

// Helper: Create skill vector from skill list
// Uses a common tech skill dictionary to encode 40-element vector
function createSkillVector(skills: string[]): number[] {
  // Common tech skills dictionary (40 most common)
  const skillDictionary = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring', 'nextjs', 'nestjs',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'cassandra', 'elasticsearch', 'firebase', 'dynamodb', 'mariadb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins', 'terraform', 'kubernetes', 'helm',
  ];

  const vector = new Array(40).fill(0);
  const normalizedSkills = skills.map(s => s.toLowerCase());

  // Mark which skills are present
  for (let i = 0; i < skillDictionary.length; i++) {
    for (const skill of normalizedSkills) {
      if (skill.includes(skillDictionary[i]) || skillDictionary[i].includes(skill)) {
        vector[i] = 1;
        break;
      }
    }
  }

  return vector;
}

// Function to calculate matched/missing skills for recommendations
export function calculateSkillMatch(
  resumeSkills: string[],
  jobSkills: string[]
): { matched: string[]; missing: string[] } {
  const resumeSkillsNorm = resumeSkills.map(s => s.toLowerCase());
  const jobSkillsNorm = jobSkills.map(s => s.toLowerCase());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const jobSkill of jobSkillsNorm) {
    const isMatched = resumeSkillsNorm.some(resumeSkill => 
      resumeSkill.includes(jobSkill.split(' ')[0]) || jobSkill.includes(resumeSkill.split(' ')[0])
    );
    
    if (isMatched) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  }

  return { matched, missing };
}

// Function to estimate learning time for a skill
export function estimateWeeksToLearn(skill: string): number {
  const skillLower = skill.toLowerCase();
  
  // Quick skills: 1-2 weeks
  if (['git', 'postman', 'figma', 'jira'].some(s => skillLower.includes(s))) return 2;
  
  // Medium skills: 2-4 weeks
  if (['react', 'vue', 'angular', 'sql', 'postgresql', 'mongodb', 'redis'].some(s => skillLower.includes(s))) return 4;
  
  // Complex skills: 4-8 weeks
  if (['kubernetes', 'terraform', 'aws', 'gcp', 'docker'].some(s => skillLower.includes(s))) return 8;
  
  // Programming languages: 4-12 weeks
  if (['python', 'java', 'go', 'rust', 'typescript'].some(s => skillLower.includes(s))) return 8;
  
  // Default: 3 weeks
  return 3;
}
