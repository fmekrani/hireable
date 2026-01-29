import { NextRequest, NextResponse } from 'next/server';
import { generateWithOllama, isOllamaAvailable } from '@/lib/ml/ollama';
import { ResumeParsed } from '@/lib/resume/parse';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

export type ChatResponse = {
  success: boolean;
  data?: {
    message: string;
    followUpQuestions?: string[];
    conversationId?: string;
  };
  error?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse>> {
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
    const { message, resume, job, predictions, conversationHistory, userId, analysisId } = body as {
      message: string;
      resume: ResumeParsed;
      job: JobOutput;
      predictions: {
        readiness: number;
        matched: number;
        missing: number;
        weeks: number;
      };
      conversationHistory?: ChatMessage[];
      userId?: string;
      analysisId?: string;
    };

    if (!message || !resume || !job) {
      return NextResponse.json(
        { success: false, error: 'Missing message, resume, or job' },
        { status: 400 }
      );
    }

    // Build the chat prompt
    const prompt = buildChatPrompt({
      resume,
      job,
      predictions,
      message,
      conversationHistory: conversationHistory || [],
    });

    // Call Ollama for response
    const response = await generateWithOllama(prompt);

    // Prepare messages with timestamps
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...(conversationHistory || []), userMessage, assistantMessage];

    // Save to Supabase if userId provided
    let conversationId: string | undefined;
    if (userId) {
      try {
        // Update or create conversation
        const { data, error } = await supabaseAdmin
          .from('conversations')
          .insert({
            user_id: userId,
            analysis_run_id: analysisId,
            messages: updatedHistory,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error saving conversation:', error);
        } else if (data) {
          conversationId = data.id;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: response.trim(),
        followUpQuestions: generateFollowUpQuestions(message),
        conversationId,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

    let errorMessage = 'Failed to generate response';
    if (error.message.includes('Ollama')) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function buildChatPrompt(context: {
  resume: ResumeParsed;
  job: JobOutput;
  predictions: {
    readiness: number;
    matched: number;
    missing: number;
    weeks: number;
  };
  message: string;
  conversationHistory: ChatMessage[];
}): string {
  const { resume, job, predictions, message, conversationHistory } = context;

  const readinessPercentage = Math.round(predictions.readiness * 100);
  const experienceGap = Math.max(0, parseFloat(job.yearsRequired) - resume.yearsExperience);

  // Build conversation history
  const history = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  return `You are a friendly and expert career advisor helping someone prepare for their next job.

CANDIDATE INFO:
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.yearsExperience} years (${resume.seniority} level)
- Current domain: ${resume.domain || 'Not specified'}

TARGET JOB:
- Position: ${job.title}
- Company domain: ${job.domain}
- Required skills: ${job.requiredSkills.join(', ')}
- Years needed: ${job.yearsRequired}

JOB MATCH:
- AI says they're ${readinessPercentage}% ready
- They have ${predictions.matched} matching skills
- They're missing ${predictions.missing} skills
- Experience gap: ${experienceGap > 0 ? experienceGap.toFixed(1) + ' years' : 'None'}

CONVERSATION SO FAR:
${history || '(No previous messages)'}

IMPORTANT:
- Be encouraging but honest
- Give specific advice tailored to THEIR situation (not generic advice)
- Reference the job requirements and their skills
- Provide actionable next steps
- Keep responses concise (2-4 sentences) unless they ask for details
- Use their name if provided

USER'S QUESTION:
${message}

Please respond as the career advisor:`;
}

function generateFollowUpQuestions(userMessage: string): string[] {
  const message = userMessage.toLowerCase();

  // Context-aware follow-up questions
  const suggestions: Record<string, string[]> = {
    timeline: [
      'How much time do I need to dedicate daily?',
      'Can I learn multiple skills in parallel?',
      'When should I start applying?',
    ],
    skills: [
      'Which skill should I learn first?',
      'Are there any quick wins?',
      'What resources would you recommend?',
    ],
    experience: [
      'Should I get a certification?',
      'What kind of projects should I build?',
      'How do I frame my current experience?',
    ],
    motivation: [
      'Am I a good fit for this role?',
      'What if I can\'t learn all the skills?',
      'Should I apply now or wait?',
    ],
  };

  let category = 'motivation';
  if (message.includes('how long') || message.includes('time')) category = 'timeline';
  if (message.includes('skill') || message.includes('learn')) category = 'skills';
  if (message.includes('experience') || message.includes('year')) category = 'experience';

  return suggestions[category] || suggestions.motivation;
}
