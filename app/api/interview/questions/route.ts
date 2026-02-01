import { NextRequest, NextResponse } from "next/server";
import { extractFeatures, calculateSkillMatch } from "@/lib/ml/featureExtraction";
import type { ResumeParsed } from "@/lib/resume/parse";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

export const runtime = "nodejs";

const execAsync = promisify(exec);

export type JobOutput = {
  title: string;
  requiredSkills: string[];
  yearsRequired: string;
  seniority: "Entry" | "Mid" | "Senior" | "Principal";
  domain: "Frontend" | "Backend" | "Full-Stack" | "DevOps" | "Data";
  location?: string;
  description: string;
  url: string;
};

export type InterviewQuestionsResponse = {
  success: boolean;
  data?: {
    readiness: number | null;
    matchedSkills: string[];
    missingSkills: string[];
    questions: string[];
  };
  error?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<InterviewQuestionsResponse>> {
  try {
    const body = await request.json();
    const { resume, job } = body as { resume: ResumeParsed; job: JobOutput };

    if (!resume || !job) {
      return NextResponse.json(
        { success: false, error: "Missing resume or job data" },
        { status: 400 }
      );
    }

    const features = extractFeatures(resume, job);
    const { matched, missing } = calculateSkillMatch(resume.skills, job.requiredSkills);

    let readiness: number | null = null;

    try {
      const projectRoot = path.resolve(process.cwd());
      const pythonScript = path.join(projectRoot, "scripts", "predict.py");
      const featuresJson = JSON.stringify({ features });
      const { stdout } = await execAsync(`python3 "${pythonScript}" '${featuresJson}'`);
      const predictions = JSON.parse(stdout) as {
        readiness: number;
        matched: number;
        missing: number;
        weeks: number;
      };
      readiness = Math.round(predictions.readiness * 100);
    } catch (pythonError) {
      console.error("Interview questions model error:", pythonError);
    }

    const questions = buildQuestions({
      job,
      matched,
      missing,
    });

    return NextResponse.json({
      success: true,
      data: {
        readiness,
        matchedSkills: matched,
        missingSkills: missing,
        questions,
      },
    });
  } catch (error) {
    console.error("Interview questions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}

function buildQuestions(input: {
  job: JobOutput;
  matched: string[];
  missing: string[];
}): string[] {
  const { job, matched, missing } = input;

  const baseQuestions = [
    `Walk me through a project that best aligns with this ${job.title} role.`,
    `Why are you interested in ${job.domain} work, and what excites you about this role?`,
    `Describe a time you had to learn a new technology quickly to deliver a result.`,
  ];

  const skillQuestions = missing.slice(0, 3).map(
    (skill) =>
      `How would you approach building competency in ${skill}? Share any exposure or a learning plan.`
  );

  const strengthQuestions = matched.slice(0, 2).map(
    (skill) =>
      `Tell me about a concrete example where you applied ${skill} and the impact it had.`
  );

  const levelQuestion =
    job.seniority === "Senior" || job.seniority === "Principal"
      ? "Design a system you recently worked on. What trade-offs did you consider?"
      : "How do you prioritize tasks when juggling multiple deadlines?";

  const questions = [...baseQuestions, ...skillQuestions, ...strengthQuestions, levelQuestion];

  return Array.from(new Set(questions)).slice(0, 8);
}
