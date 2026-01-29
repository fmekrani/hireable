import { NextResponse } from "next/server";
import { parseResumeFromExtraction, type ResumeParsed } from "../../../../lib/resume/parse";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

export const runtime = "nodejs"; // Need Node.js for fs + child_process

// Health check
export async function GET() {
  return NextResponse.json({ ok: true });
}

/*
Curl example:

curl -X POST http://localhost:3000/api/upload/resume -F "file=@./resume.pdf"

*/

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json({ error: "Unsupported Media Type" }, { status: 415 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const fileName = file.name || "upload.pdf";
    const fileType = (file.type || "").toLowerCase();
    const isPdf = fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Unsupported file type. Only PDF allowed." }, { status: 415 });
    }

    const size = (file as any).size as number;
    if (typeof size === "number" && size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    // Save to /tmp
    const uuid = crypto.randomUUID();
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, `resume-${uuid}.pdf`);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tmpPath, buf);

    // Run python extractor
    const extraction = await runPythonExtractor(tmpPath);
    // Clean up file
    void fs.unlink(tmpPath).catch(() => {});

    // Parse to required schema
    let parsed: ResumeParsed | null = null;
    try {
      parsed = parseResumeFromExtraction(extraction);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `Parser failure: ${msg}` }, { status: 500 });
    }

    // Return strictly matching shape
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function runPythonExtractor(tmpPath: string): Promise<{ rawText: string; pages: string[]; error?: string | null }> {
  // TODO: Consider swapping to Node pdf-parse for Vercel later
  return await new Promise((resolve) => {
    execFile(
      "python3",
      [path.join(process.cwd(), "scripts", "pdf_parser.py"), tmpPath],
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        let payload: { rawText: string; pages: string[]; error?: string | null } = { rawText: "", pages: [], error: null };
        try {
          if (stdout) {
            payload = JSON.parse(stdout.toString());
          } else if (stderr) {
            payload = { rawText: "", pages: [], error: stderr.toString() };
          }
        } catch (e) {
          payload = { rawText: "", pages: [], error: `JSON parse error: ${(e as Error).message}` };
        }
        if (error) {
          const baseErr = error.message || String(error);
          payload.error = payload.error ? `${payload.error}; ${baseErr}` : baseErr;
        }
        resolve(payload);
      }
    );
  });
}
