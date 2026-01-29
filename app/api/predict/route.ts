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

export type PredictionResponse = {
  success: boolean;
  data?: {
    readiness: number; // 0-100
    matchedSkills: string[];
    missingSkills: string[];
    timeline: Array<{ skill: string; weeks: number }>;
    recommendations: Recommendation[];
  };
  error?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<PredictionResponse>> {
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

    if (!resume.skills || !job.requiredSkills) {
      return NextResponse.json(
        { success: false, error: 'Invalid resume or job format' },
        { status: 400 }
      );
    }

    // Step 1: Extract features
    const features = extractFeatures(resume, job);

    if (features.length !== 90) {
      return NextResponse.json(
        { success: false, error: `Feature extraction produced ${features.length} features instead of 90` },
        { status: 500 }
      );
    }

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
      // Fallback: Use model from Node.js (if TensorFlow.js available)
      // For now, return error
      return NextResponse.json(
        { success: false, error: 'Failed to run model predictions' },
        { status: 500 }
      );
    }

    // Step 3: Calculate matched and missing skills
    const { matched, missing } = calculateSkillMatch(resume.skills, job.requiredSkills);

    // Step 4: Create timeline for missing skills
    const timeline = missing.slice(0, 5).map(skill => ({
      skill,
      weeks: estimateWeeksToLearn(skill),
    }));

    // Step 5: Generate recommendations
    const readinessScore = predictions.readiness; // 0-1
    const recommendations = generateRecommendations(
      resume,
      job,
      readinessScore,
      matched,
      missing
    );

    // Return prediction response
    return NextResponse.json({
      success: true,
      data: {
        readiness: Math.round(readinessScore * 100), // Convert to 0-100
        matchedSkills: matched,
        missingSkills: missing,
        timeline,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process prediction request' },
      { status: 500 }
    );
  }
}
