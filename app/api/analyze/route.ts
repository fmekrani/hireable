import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { extractFeatures, calculateSkillMatch, estimateWeeksToLearn } from '@/lib/ml/featureExtraction';
import { generateRecommendations, Recommendation } from '@/lib/ml/recommendations';
import { ResumeParsed } from '@/lib/resume/parse';

const execAsync = promisify(exec);

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

export type AnalysisResponse = {
  success: boolean;
  data?: {
    job: {
      title: string;
      domain: string;
      yearsRequired: string;
      seniority: string;
    };
    readiness: {
      score: number; // 0-100
      interpretation: string;
      confidence: number; // 0-1
    };
    skillMatch: {
      matched: string[];
      partial: string[];
      missing: string[];
      matchPercentage: number; // 0-100
    };
    experienceGap: {
      yearsRequired: number;
      yearsActual: number;
      gap: number;
      assessment: string;
    };
    timeline: Array<{
      skill: string;
      weeks: number;
      priority: 'high' | 'medium' | 'low';
    }>;
    recommendations: Recommendation[];
    summary: string;
  };
  error?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    // Parse request body
    const body = await request.json();
    const { resume, job } = body as { resume: ResumeParsed; job: JobOutput };

    // Validate inputs
    if (!resume || !job) {
      return NextResponse.json(
        { success: false, error: 'Missing resume or job data' },
        { status: 400 }
      );
    }

    // Step 1: Extract features
    const features = extractFeatures(resume, job);

    // Step 2: Call Python inference script
    const projectRoot = path.resolve(process.cwd());
    const pythonScript = path.join(projectRoot, 'scripts', 'predict.py');
    const featuresJson = JSON.stringify({ features });

    let predictions: { readiness: number; matched: number; missing: number; weeks: number };
    try {
      const { stdout } = await execAsync(`python3 "${pythonScript}" '${featuresJson}'`);
      predictions = JSON.parse(stdout);
    } catch (pythonError: any) {
      console.error('Python prediction error:', pythonError);
      return NextResponse.json(
        { success: false, error: 'Failed to run model predictions' },
        { status: 500 }
      );
    }

    // Step 3: Detailed skill analysis
    const { matched, missing } = calculateSkillMatch(resume.skills, job.requiredSkills);

    // Partial matches (skills that are somewhat related)
    const partial = resume.skills.filter(
      skill =>
        !matched.includes(skill) &&
        job.requiredSkills.some(jobSkill =>
          skill.toLowerCase().includes(jobSkill.toLowerCase().split(' ')[0]) ||
          jobSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
        )
    );

    // Step 4: Experience analysis
    const yearsRequired = parseFloat(job.yearsRequired) || 0;
    const yearsActual = resume.yearsExperience;
    const gap = Math.max(0, yearsRequired - yearsActual);

    let experienceAssessment = '';
    if (gap < 0) {
      experienceAssessment = `You have ${Math.abs(gap).toFixed(1)} more years of experience than required - you're overqualified!`;
    } else if (gap === 0) {
      experienceAssessment = `You have the exact experience level required for this role.`;
    } else if (gap <= 1) {
      experienceAssessment = `You're slightly under the experience requirement by ${gap.toFixed(1)} years. This is often acceptable with strong skills.`;
    } else if (gap <= 3) {
      experienceAssessment = `You need ${gap.toFixed(1)} more years of experience to fully match this role's requirements.`;
    } else {
      experienceAssessment = `You need significant experience (${gap.toFixed(1)} years) to reach this role's level.`;
    }

    // Step 5: Readiness interpretation
    const readinessScore = Math.round(predictions.readiness * 100);
    let interpretation = '';
    let confidence = Math.min(0.95, predictions.readiness + 0.1);

    if (readinessScore >= 80) {
      interpretation = 'Excellent match - you should apply!';
      confidence = 0.95;
    } else if (readinessScore >= 60) {
      interpretation = 'Good match - your application could be competitive.';
      confidence = 0.85;
    } else if (readinessScore >= 40) {
      interpretation = 'Moderate match - highlight transferable skills in your application.';
      confidence = 0.75;
    } else if (readinessScore >= 20) {
      interpretation = 'Weak match - consider gaining more skills before applying.';
      confidence = 0.65;
    } else {
      interpretation = 'Poor match - this role may not be suitable at this time.';
      confidence = 0.6;
    }

    // Step 6: Timeline with priorities
    const allMissing = missing.map(skill => ({
      skill,
      weeks: estimateWeeksToLearn(skill),
    }));

    // Sort by weeks and assign priorities
    const timeline = allMissing
      .sort((a, b) => b.weeks - a.weeks)
      .slice(0, 10)
      .map(item => ({
        ...item,
        priority: item.weeks <= 2 ? ('low' as const) : item.weeks <= 4 ? ('medium' as const) : ('high' as const),
      }));

    // Step 7: Generate recommendations
    const recommendations = generateRecommendations(
      resume,
      job,
      predictions.readiness,
      matched,
      missing
    );

    // Step 8: Generate summary
    const totalWeeks = timeline.reduce((sum, item) => sum + item.weeks, 0);
    let summary = `Based on your profile, you are ${readinessScore}% ready for this ${job.seniority} ${job.domain} role.\n`;

    if (matched.length > 0) {
      summary += `You have ${matched.length} of the required skills. `;
    }
    if (missing.length > 0) {
      summary += `You're missing ${missing.length} skills which would take approximately ${totalWeeks} weeks to learn.`;
    } else {
      summary += `You have all the required skills!`;
    }

    if (gap > 0) {
      summary += ` Additionally, you need to gain ${gap.toFixed(1)} years of experience in this domain.`;
    }

    // Return analysis response
    return NextResponse.json({
      success: true,
      data: {
        job: {
          title: job.title,
          domain: job.domain,
          yearsRequired: job.yearsRequired,
          seniority: job.seniority,
        },
        readiness: {
          score: readinessScore,
          interpretation,
          confidence,
        },
        skillMatch: {
          matched,
          partial,
          missing,
          matchPercentage: job.requiredSkills.length > 0
            ? Math.round((matched.length / job.requiredSkills.length) * 100)
            : 0,
        },
        experienceGap: {
          yearsRequired,
          yearsActual,
          gap,
          assessment: experienceAssessment,
        },
        timeline,
        recommendations,
        summary,
      },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process analysis request' },
      { status: 500 }
    );
  }
}

function parseFloat(value: string | number): number {
  if (typeof value === 'number') return value;
  const match = (value as string).match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
