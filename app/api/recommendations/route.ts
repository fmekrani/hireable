import { NextRequest, NextResponse } from 'next/server';
import { generateWithOllama, parseJSONFromResponse, isOllamaAvailable } from '@/lib/ml/ollama';
import { ResumeParsed } from '@/lib/resume/parse';

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

export type LLMRecommendation = {
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedWeeks?: number;
  actionItems?: string[];
};

export type RecommendationsResponse = {
  success: boolean;
  data?: {
    readiness: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: LLMRecommendation[];
  };
  error?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<RecommendationsResponse>> {
  try {
    // Check if Ollama is available
    const ollamaAvailable = await isOllamaAvailable();
    if (!ollamaAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ollama is not running. Start it with: ollama serve',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { resume, job, predictions } = body as {
      resume: ResumeParsed;
      job: JobOutput;
      predictions: {
        readiness: number;
        matched: number;
        missing: number;
        weeks: number;
      };
    };

    if (!resume || !job || !predictions) {
      return NextResponse.json(
        { success: false, error: 'Missing resume, job, or predictions' },
        { status: 400 }
      );
    }

    // Calculate skill gaps
    const matchedSkills = resume.skills.filter(skill =>
      job.requiredSkills.some(jobSkill =>
        skill.toLowerCase().includes(jobSkill.toLowerCase().split(' ')[0]) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
      )
    );

    const missingSkills = job.requiredSkills.filter(
      jobSkill =>
        !resume.skills.some(resumeSkill =>
          resumeSkill.toLowerCase().includes(jobSkill.toLowerCase().split(' ')[0]) ||
          jobSkill.toLowerCase().includes(resumeSkill.toLowerCase().split(' ')[0])
        )
    );

    // Build context for Ollama
    const experienceGap = Math.max(0, parseFloat(job.yearsRequired) - resume.yearsExperience);
    const readinessPercentage = Math.round(predictions.readiness * 100);

    const prompt = buildRecommendationPrompt({
      resume,
      job,
      readinessPercentage,
      matchedSkills,
      missingSkills,
      experienceGap,
    });

    // Call Ollama to generate recommendations
    const ollama_response = await generateWithOllama(prompt);

    // Parse the response
    const recommendations = parseJSONFromResponse(ollama_response);

    // Validate and normalize recommendations
    const validatedRecommendations = validateRecommendations(recommendations);

    return NextResponse.json({
      success: true,
      data: {
        readiness: readinessPercentage,
        matchedSkills,
        missingSkills,
        recommendations: validatedRecommendations,
      },
    });
  } catch (error: any) {
    console.error('Recommendations API error:', error);

    let errorMessage = 'Failed to generate recommendations';
    if (error.message.includes('Ollama')) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function buildRecommendationPrompt(context: {
  resume: ResumeParsed;
  job: JobOutput;
  readinessPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceGap: number;
}): string {
  const {
    resume,
    job,
    readinessPercentage,
    matchedSkills,
    missingSkills,
    experienceGap,
  } = context;

  return `You are an expert career advisor helping someone prepare for a job.

CANDIDATE PROFILE:
- Current Skills: ${resume.skills.join(', ')}
- Experience: ${resume.yearsExperience} years (${resume.seniority} level)
- Education: ${resume.education || 'Not specified'}
- Domain: ${resume.domain || 'Not specified'}

TARGET JOB:
- Title: ${job.title}
- Company Domain: ${job.domain}
- Required Skills: ${job.requiredSkills.join(', ')}
- Experience Needed: ${job.yearsRequired}
- Required Seniority: ${job.seniority}
- Location: ${job.location || 'Not specified'}

MATCH ANALYSIS:
- AI Readiness Score: ${readinessPercentage}%
- Matched Skills: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None yet'}
- Missing Skills: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'All matched!'}
- Experience Gap: ${experienceGap > 0 ? experienceGap.toFixed(1) + ' years' : 'Exactly matches'}

Based on this analysis, generate 4-5 specific, actionable recommendations in priority order.

IMPORTANT: Return ONLY a valid JSON array with this exact structure. No markdown, no code blocks, no extra text:
[
  {
    "title": "Specific action (e.g., Learn TypeScript)",
    "reason": "Why this is important for THIS specific role and candidate",
    "priority": "high or medium or low",
    "estimatedWeeks": number (estimated time to complete),
    "actionItems": ["specific step 1", "specific step 2"]
  }
]

Focus on:
1. What will most improve their readiness
2. Quick wins vs long-term investments
3. How each recommendation directly relates to the job
4. Realistic timelines

Generate the JSON array now:`;
}

function validateRecommendations(
  data: any
): LLMRecommendation[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected array of recommendations');
  }

  return data
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      title: String(item.title || 'Untitled'),
      reason: String(item.reason || 'No reason provided'),
      priority: ['high', 'medium', 'low'].includes(item.priority)
        ? (item.priority as 'high' | 'medium' | 'low')
        : 'medium',
      estimatedWeeks: typeof item.estimatedWeeks === 'number' ? item.estimatedWeeks : undefined,
      actionItems: Array.isArray(item.actionItems) ? item.actionItems : undefined,
    }))
    .slice(0, 5); // Limit to 5 recommendations
}
