"use client";

import { useMemo, useState } from "react";
import type { ResumeParsed } from "@/lib/resume/parse";
import { VapiInterviewer } from "@/components/interview/vapi-interviewer";

const defaultJob = {
  title: "",
  requiredSkills: "",
  yearsRequired: "",
  seniority: "Mid" as const,
  domain: "Full-Stack" as const,
  description: "",
};

type JobFormState = typeof defaultJob;

type InterviewQuestionsResponse = {
  success: boolean;
  data?: {
    readiness: number | null;
    matchedSkills: string[];
    missingSkills: string[];
    questions: string[];
  };
  error?: string;
};

export function AiInterviewer() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeParsed, setResumeParsed] = useState<ResumeParsed | null>(null);
  const [job, setJob] = useState<JobFormState>(defaultJob);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const requiredSkillsArray = useMemo(() => {
    return job.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [job.requiredSkills]);

  const vapiVariables = useMemo(() => {
    if (!questions.length) return undefined;
    return {
      jobTitle: job.title,
      interviewRole: job.title,
      seniority: job.seniority,
      domain: job.domain,
      readiness: readiness ?? "n/a",
      matchedSkills: matchedSkills.join(", "),
      missingSkills: missingSkills.join(", "),
      questions: questions.join("\n"),
    };
  }, [job, readiness, matchedSkills, missingSkills, questions]);

  const canGenerate = resumeParsed && requiredSkillsArray.length > 0 && job.title.trim();

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to parse resume");
      }

      const parsed = (await response.json()) as ResumeParsed;
      setResumeParsed(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!canGenerate || !resumeParsed) return;
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        resume: resumeParsed,
        job: {
          title: job.title,
          requiredSkills: requiredSkillsArray,
          yearsRequired: job.yearsRequired || "",
          seniority: job.seniority,
          domain: job.domain,
          description: job.description || "",
          url: "",
        },
      };

      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as InterviewQuestionsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to generate interview questions");
      }

      setQuestions(result.data.questions);
      setReadiness(result.data.readiness);
      setMissingSkills(result.data.missingSkills);
      setMatchedSkills(result.data.matchedSkills);
      setCurrentIndex(0);
      setResponses({});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Personalized AI Interviewer</h2>
      <p className="text-white/60 mb-6">
        Upload your resume and enter the job requirements to generate an interview tailored by the readiness model.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Resume (PDF)</label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="text-white text-sm"
              />
              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || isUploading}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                {isUploading ? "Parsing..." : "Parse Resume"}
              </button>
            </div>
          </div>

          {resumeParsed && (
            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/60 mb-2">Parsed Resume Snapshot</p>
              <div className="text-sm text-white">
                <p>Seniority: {resumeParsed.seniority}</p>
                <p>Years Experience: {resumeParsed.yearsExperience}</p>
                <p className="mt-2 text-white/70">Skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {resumeParsed.skills.slice(0, 12).map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 rounded-full bg-white/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Job Title</label>
            <input
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
              placeholder="Senior Frontend Engineer"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Required Skills (comma separated)</label>
            <input
              value={job.requiredSkills}
              onChange={(e) => setJob({ ...job, requiredSkills: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
              placeholder="React, TypeScript, System Design"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm text-white/70 mb-2">Years Required</label>
              <input
                value={job.yearsRequired}
                onChange={(e) => setJob({ ...job, yearsRequired: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
                placeholder="5+ years"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Seniority</label>
              <select
                value={job.seniority}
                onChange={(e) => setJob({ ...job, seniority: e.target.value as JobFormState["seniority"] })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Principal">Principal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Domain</label>
              <select
                value={job.domain}
                onChange={(e) => setJob({ ...job, domain: e.target.value as JobFormState["domain"] })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="DevOps">DevOps</option>
                <option value="Data">Data</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Job Description (optional)</label>
            <textarea
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 min-h-[100px]"
              placeholder="Paste a short description..."
            />
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={!canGenerate || isGenerating}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Interview"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="text-white text-sm">
              Readiness: {readiness !== null ? `${readiness}%` : "n/a"}
            </div>
            <div className="text-xs text-white/60">Matched: {matchedSkills.length}</div>
            <div className="text-xs text-white/60">Missing: {missingSkills.length}</div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/70 mb-2">Interview Questions</p>
              <ol className="list-decimal list-inside text-sm text-white/90 space-y-2">
                {questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/70 mb-2">Practice Session</p>
              <div className="text-white font-semibold mb-2">Q{currentIndex + 1}: {questions[currentIndex]}</div>
              <textarea
                value={responses[currentIndex] || ""}
                onChange={(e) => setResponses((prev) => ({ ...prev, [currentIndex]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 min-h-[120px]"
                placeholder="Type your response..."
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                  disabled={currentIndex === 0}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                  disabled={currentIndex >= questions.length - 1}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <VapiInterviewer
              assistantName="Hireable AI Interviewer"
              variableValues={vapiVariables}
              firstMessage={`Hello! I will conduct your ${job.seniority} ${job.title} interview. Let's begin.`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
