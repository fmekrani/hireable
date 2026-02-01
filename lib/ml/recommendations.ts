import { ResumeParsed } from '../resume/parse';
import { JobOutput, calculateSkillMatch, estimateWeeksToLearn } from './featureExtraction';

export type Recommendation = {
  type: 'add_skills' | 'add_experience' | 'rewrite_bullet' | 'strengthen_match' | 'add_certifications';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  detail: string;
  current?: string;
  suggested?: string;
};

export function generateRecommendations(
  resume: ResumeParsed,
  job: JobOutput,
  readinessScore: number,
  matchedSkills: string[],
  missingSkills: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Add missing critical skills
  if (missingSkills.length > 0) {
    const highPrioritySkills = missingSkills.slice(0, 3); // Top 3 missing
    
    if (highPrioritySkills.length > 0) {
      recommendations.push({
        type: 'add_skills',
        priority: missingSkills.length > 5 ? 'high' : 'medium',
        suggestion: `Learn ${highPrioritySkills.join(', ')}`,
        detail: `The position requires ${highPrioritySkills.join(', ')} which are not listed on your resume. Adding these skills would significantly improve your match (estimated ${estimateWeeksToLearn(highPrioritySkills[0])} weeks per skill).`,
      });
    }
  }

  // 2. Add experience if gap exists
  const yearsRequiredNum = parseFloat(job.yearsRequired) || 0;
  const yearsGap = Math.max(0, yearsRequiredNum - resume.yearsExperience);
  
  if (yearsGap > 2) {
    recommendations.push({
      type: 'add_experience',
      priority: 'high',
      suggestion: `Build ${yearsGap.toFixed(1)} more years of relevant experience`,
      detail: `The role requires ${yearsRequiredNum} years of experience, but your resume shows ${resume.yearsExperience} years. Consider taking on more senior projects or roles to close this gap.`,
    });
  }

  // 3. Strengthen seniority alignment
  const resumeSeniorityMap: Record<string, number> = {
    'Entry': 1,
    'Mid': 2,
    'Senior': 3,
    'Principal': 4,
  };
  const jobSeniorityMap: Record<string, number> = {
    'Entry': 1,
    'Mid': 2,
    'Senior': 3,
    'Principal': 4,
  };

  const resumeSeniorityLevel = resumeSeniorityMap[resume.seniority] || 1;
  const jobSeniorityLevel = jobSeniorityMap[job.seniority] || 2;

  if (resumeSeniorityLevel < jobSeniorityLevel) {
    recommendations.push({
      type: 'strengthen_match',
      priority: jobSeniorityLevel - resumeSeniorityLevel > 1 ? 'high' : 'medium',
      suggestion: `Highlight ${job.seniority}-level accomplishments`,
      detail: `The role seeks a ${job.seniority}-level candidate, but your experience appears ${resume.seniority}. Rewrite your bullet points to showcase leadership, mentoring, and strategic impact.`,
    });
  }

  // 4. Add relevant certifications
  if (missingSkills.length > 0) {
    const certificationRecommendations = getCertifications(job.domain, missingSkills);
    if (certificationRecommendations.length > 0) {
      recommendations.push({
        type: 'add_certifications',
        priority: 'medium',
        suggestion: `Pursue ${certificationRecommendations[0]} certification`,
        detail: `Earning a ${certificationRecommendations[0]} would validate your expertise in key technologies for this role (${job.domain} development). Most take 2-4 weeks to complete.`,
      });
    }
  }

  // 5. Rewrite bullets to match job description
  if (matchedSkills.length > 0 && readinessScore < 0.7) {
    recommendations.push({
      type: 'rewrite_bullet',
      priority: 'medium',
      suggestion: `Emphasize ${matchedSkills.slice(0, 2).join(', ')} experience`,
      detail: `You have skills that match this role (${matchedSkills.slice(0, 3).join(', ')}). Rewrite your resume bullets to highlight these skills using keywords from the job description for better ATS matching and human review.`,
      current: 'Built web application with modern stack',
      suggested: `Built ${matchedSkills[0]}-based web application managing 10K+ users and 99.9% uptime`,
    });
  }

  // 6. If readiness is very low, suggest broader actions
  if (readinessScore < 0.3) {
    recommendations.push({
      type: 'add_experience',
      priority: 'high',
      suggestion: 'Consider roles that bridge your current experience to this target',
      detail: `With a ${(readinessScore * 100).toFixed(0)}% match, this role may be a reach. Consider applying to similar but less senior positions first to build relevant experience.`,
    });
  }

  // Sort by priority and limit to 5
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 5);
}

function getCertifications(domain: string, missingSkills: string[]): string[] {
  const domainCerts: Record<string, string[]> = {
    'Frontend': ['AWS Solutions Architect', 'Google Cloud Associate', 'Azure Developer'],
    'Backend': ['AWS Solutions Architect', 'CKA (Kubernetes)', 'HashiCorp Certified Terraform'],
    'Full-Stack': ['AWS Developer', 'Google Cloud Associate', 'Azure Developer'],
    'DevOps': ['CKA', 'HashiCorp Certified Terraform', 'AWS Solutions Architect'],
    'Data': ['Google Cloud Data Engineer', 'AWS Certified Data Analytics', 'Databricks Certified'],
  };

  const relevant = domainCerts[domain] || [];
  
  // Also check specific skills
  for (const skill of missingSkills) {
    if (skill.toLowerCase().includes('aws')) return ['AWS Developer Associate'];
    if (skill.toLowerCase().includes('kubernetes')) return ['Certified Kubernetes Administrator'];
    if (skill.toLowerCase().includes('terraform')) return ['HashiCorp Certified Terraform'];
  }

  return relevant.slice(0, 1);
}

function parseFloat(value: string | number): number {
  if (typeof value === 'number') return value;
  const match = (value as string).match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
