# Resume Scraper Backend Implementation Guide

## Overview

This guide documents the complete resume scraper implementation integrated with the job web scraper. Both systems share the same skill canonicalization logic and database patterns for seamless job-resume matching.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│
├─→ POST /api/upload/resume  (multipart form-data)
│   └─→ Stores file + extracts + normalizes skills
│
├─→ POST /api/resume/extract (multipart form-data)
│   └─→ Quick text extraction (stateless preview)
│
├─→ POST /api/resume/parse   (JSON: {resume_id})
│   └─→ Re-parse stored resume from Supabase Storage
│
└─→ POST /api/job/match      (JSON: {resume_skills[], job_skills[]})
    └─→ Calculates skill overlap score
```

### Shared Components

| Component | Location | Used By |
|-----------|----------|---------|
| Skill Canonicalization | `/lib/skills/canonicalSkills.ts` | Resume + Job Scraper |
| Skill Overlap Matching | `getSkillOverlap()` in canonicalSkills.ts | Resume-Job Analysis |
| Supabase Server Client | `/lib/supabase/server.ts` | All authenticated endpoints |
| Storage Bucket | `resumes` in Supabase | Resume file storage |
| Text Extraction | `/lib/resume/extractors/` | PDF + DOCX support |

## Database Schema

### Table: `public.resumes`

```sql
CREATE TABLE public.resumes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.users(id),
  file_name         text NOT NULL,
  file_path         text NOT NULL,
  raw_text          text,
  parsed_data       jsonb,
  uploaded_at       timestamp DEFAULT now(),
  parsed_at         timestamp
);
```

### Storage Bucket: `resumes`

- **Path Pattern**: `{user_id}/{timestamp}-{sanitized_filename}`
- **Example**: `550e8400-e29b-41d4-a716-446655440000/1709312400000-resume.pdf`

### Stored Data Structure

```json
{
  "parsed_data": {
    "rawText": "Full extracted text from resume...",
    "skills": ["Python", "SQL", "Docker", "AWS"],
    "techStack": ["Python", "SQL"],
    "metadata": {
      "pages": 2,
      "fileType": "application/pdf",
      "wordCount": 3247,
      "warnings": [],
      "extractedAt": "2026-03-01T12:00:00Z",
      "source": "resume_scrape_v2"
    },
    "structured": {
      "skills": ["Python", "SQL", "Docker"],
      "yearsExperience": 5,
      "seniority": "Mid",
      "domain": "Backend",
      "education": "Bachelor",
      "meta": { ... }
    }
  }
}
```

## API Endpoints

### 1. Health Check

**GET /api/health**

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "ok": true,
  "message": "Backend is running",
  "timestamp": "2026-03-01T12:00:00Z"
}
```

### 2. Upload & Parse Resume

**POST /api/upload/resume**

Accepts a PDF, DOCX, or DOC file. Uploads to Supabase Storage, extracts text, normalizes skills, and stores both raw and structured data in the database.

**Request:**
```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@/path/to/resume.pdf"
```

**Response (200):**
```json
{
  "success": true,
  "resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "resume": {
    "file_name": "resume.pdf",
    "skills": ["Python", "SQL", "Docker"],
    "years_experience": 5,
    "seniority": "Mid",
    "domain": "Backend"
  },
  "resume_data": {
    "file_name": "resume.pdf",
    "rawText": "Full extracted text...",
    "skills": ["Python", "SQL", "Docker"],
    "tech_stack": ["Python", "SQL"],
    "metadata": { ... },
    "structured": { ... },
    "parsed_at": "2026-03-01T12:00:00Z",
    "source": "resume_scrape_v2"
  }
}
```

**Errors:**
- 400: Missing or unsupported file type
- 413: File too large (>10MB)
- 415: Unsupported media type
- 500: Server error

**Implementation Details:**
- Requires authentication (checks `getServerUser()`)
- Calls `uploadAndParseResume()` from `/lib/resume/services/resume-scraper.ts`
- Uses extractors from `/lib/resume/extractors/` (PdfExtractor, DocxExtractor)
- Normalizes skills using `normalizeSkillsFromText()` from `/lib/skills/canonicalSkills.ts`
- Stores in `public.resumes` table with `raw_text` and `parsed_data` JSONB

### 3. Extract Resume Text (Stateless Preview)

**POST /api/resume/extract**

Quick text extraction without saving. Useful for UI preview before uploading.

**Request:**
```bash
curl -X POST http://localhost:3000/api/resume/extract \
  -F "file=@/path/to/resume.pdf"
```

**Response (200):**
```json
{
  "success": true,
  "text": "Extracted resume text...",
  "skills": ["Python", "SQL", "Docker"],
  "tech_stack": ["Python", "SQL"],
  "parsed": {
    "experience": [...],
    "education": [...],
    "skills": { ... }
  },
  "fileName": "resume.pdf",
  "fileSize": 245621,
  "pageCount": 2,
  "metadata": { ... },
  "warnings": []
}
```

**Implementation Details:**
- No authentication required
- Stateless (doesn't save to database)
- Suitable for frontend preview UI
- Calls `getExtractorByExtension()` from `/lib/resume/extractors/factory.ts`

### 4. Re-Parse Stored Resume

**POST /api/resume/parse**

Downloads a resume from Supabase Storage by ID and re-parses it. Useful for updating parsing logic without re-uploading.

**Request:**
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{"resume_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

**Response (200):**
```json
{
  "success": true,
  "resume_id": "550e8400-e29b-41d4-a716-446655440000",
  "resume": {
    "file_name": "resume.pdf",
    "skills": ["Python", "SQL", "Docker"],
    "years_experience": 5,
    "seniority": "Mid",
    "domain": "Backend"
  },
  "resume_data": { ... }
}
```

**Errors:**
- 400: Missing resume_id
- 401: Unauthorized
- 404: Resume not found
- 500: Parsing failed

**Implementation Details:**
- Requires authentication
- Verifies user ownership via `getServerUser()`
- Downloads from Supabase Storage bucket `resumes`
- Calls `parseAndPersistResumeById()` from `/lib/resume/services/resume-scraper.ts`
- Updates `raw_text` and `parsed_data` in database

### 5. Job-Resume Skill Matching

**POST /api/job/match**

Compares resume skills against job requirements. Uses the same canonicalization logic as the job web scraper.

**Request (Option 1 - Direct arrays):**
```bash
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume_skills": ["Python", "SQL", "Docker", "AWS"],
    "job_skills": ["Python", "Docker", "Kubernetes", "GCP"]
  }'
```

**Request (Option 2 - From stored resume):**
```bash
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "550e8400-e29b-41d4-a716-446655440000",
    "job_skills": ["Python", "Docker", "Kubernetes"]
  }'
```

**Response (200):**
```json
{
  "success": true,
  "resume_skills_count": 4,
  "job_skills_count": 3,
  "matched_skills": ["Python", "Docker"],
  "missing_skills": ["Kubernetes", "GCP"],
  "match_percentage": 67,
  "details": {
    "matched_count": 2,
    "missing_count": 2,
    "total_job_skills": 3,
    "match_score": "67%",
    "ready_to_apply": false,
    "learning_priority": ["Kubernetes"]
  }
}
```

**Errors:**
- 400: Missing required fields
- 401: Unauthorized (when using resume_id)
- 404: Resume not found
- 500: Server error

**Implementation Details:**
- No auth required for direct skill arrays
- Auth required only when fetching resume by ID
- Uses `getSkillOverlapSummary()` from `/lib/skills/canonicalSkills.ts`
- Same skill canonicalization as job web scraper
- Compares case-insensitively with alias normalization

## Skill Canonicalization

Both resume parser and job scraper use **the same skill mapping system**.

### How It Works

1. **Input**: Raw text containing skill mentions
2. **Matching**: Case-insensitive regex with word boundaries
3. **Mapping**: Aliases → canonical forms (e.g., "NodeJS" → "Node.js")
4. **Output**: Array of canonical skill strings

### Example Mappings

```typescript
"PowerBI" | "powerbi" | "PBI" → "Power BI"
"nodejs" | "node js" | "NodeJS" → "Node.js"
"mssql" | "sql server" → "SQL Server"
"kubernetes" | "k8s" → "Kubernetes"
"typescript" | "ts" → "TypeScript"
```

### Key File

**`/lib/skills/canonicalSkills.ts`**

Provides:
- `normalizeSkillsFromText(text)` → `string[]`
- `getSkillOverlap(resumeSkills, jobSkills)` → `{ matched, missing, matchPercentage }`
- `getSkillOverlapSummary(resumeSkills, jobSkills)` → `{ matchedSkills, missingSkills, score }`

## Implementation Details

### Text Extraction

**Supported Formats:**
- PDF (via `pdf-parse` library)
- DOCX (via `mammoth` library)

**Extraction Flow:**
```
File Buffer
  ↓
getExtractor(fileType)
  ↓
Extractor.extract(buffer)
  ↓
ExtractionResult { text, pageCount, warnings, metadata }
```

**Files:**
- `/lib/resume/extractors/pdf-extractor.ts` - pdf-parse wrapper
- `/lib/resume/extractors/docx-extractor.ts` - mammoth wrapper
- `/lib/resume/extractors/factory.ts` - Routing by MIME type or extension

### Structured Resume Parsing

Optionally extracts structure from raw text:
- Years of experience
- Seniority level (Entry, Mid, Senior, Principal)
- Domain (Frontend, Backend, Full-Stack, DevOps, Data)
- Education level (Bootcamp, Bachelor, Master, PhD)

**File:** `/lib/resume/parse.ts`

Uses:
- Pattern matching for experience dates
- Skill-based domain classification
- Education keyword detection

### Service Layer

**`/lib/resume/services/resume-scraper.ts`**

Exports:
- `uploadAndParseResume(params)` - Upload + parse + store
- `parseAndPersistResumeById(params)` - Re-parse stored resume
- `extractResumeText(fileBytes, fileType)` - Text extraction only

**`/lib/resume/services/ingestion.ts`**

Exports:
- `extractResumeText(fileUrl)` - Download from Storage + extract
- `processResume(resumeId)` - Full ingestion pipeline
- `batchProcessResumes(resumeIds)` - Batch processing

## Testing

### Integration Test Suite

```bash
# Run all tests (health check + skill matching + extraction)
npm run dev  # in one terminal
bash scripts/integration-test-resume.sh

# Test with a sample resume
bash scripts/integration-test-resume.sh /path/to/resume.pdf

# Custom API endpoint
BASE_URL=http://localhost:3001 bash scripts/integration-test-resume.sh
```

### Manual Testing

**1. Upload Resume:**
```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@~/Desktop/resume.pdf" \
  | jq '.resume_id' -r > /tmp/resume_id.txt

RESUME_ID=$(cat /tmp/resume_id.txt)
echo "Resume ID: $RESUME_ID"
```

**2. Parse Stored Resume:**
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d "{\"resume_id\":\"$RESUME_ID\"}"
```

**3. Test Skill Matching:**
```bash
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "'$RESUME_ID'",
    "job_skills": ["Python", "Docker", "Kubernetes"]
  }' | jq '.'
```

**4. Check Database:**
```sql
-- In Supabase SQL Editor:
SELECT 
  id, 
  user_id, 
  file_name, 
  length(raw_text) as raw_text_length,
  parsed_data->>'source' as source,
  parsed_at
FROM public.resumes
ORDER BY uploaded_at DESC
LIMIT 5;
```

## Dependencies

Package.json already includes:
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction
- `@supabase/supabase-js` - Database + Storage
- `next` 15.5.7 - Server runtime

No additional dependencies needed.

## File Structure

```
lib/
├── resume/
│   ├── extractors/
│   │   ├── pdf-extractor.ts       # PdfExtractor class
│   │   ├── docx-extractor.ts      # DocxExtractor class
│   │   ├── factory.ts             # getExtractorByExtension()
│   │   └── types.ts               # DocumentExtractor interface
│   ├── services/
│   │   ├── resume-scraper.ts      # uploadAndParseResume(), parseAndPersistResumeById()
│   │   ├── ingestion.ts           # processResume(), batch processing
│   │   └── index.ts               # Barrel exports
│   ├── parser/
│   │   └── section-parser.ts      # parseResume() structured output
│   ├── parse.ts                   # parseResumeFromExtraction() main API
│   └── skillDictionary.ts         # Skill aliases
│
├── skills/
│   ├── canonicalSkills.ts         # normalizeSkillsFromText(), getSkillOverlap()
│   └── matching.ts                # Skill comparison utilities
│
├── supabase/
│   ├── server.ts                  # createServerSupabaseClient(), getServerUser()
│   ├── admin.ts                   # Admin operations
│   └── client.ts                  # Browser client
│
└── scraper/
    ├── extractSkills.ts           # Job scraper skill extraction
    └── ... (job scraping utilities)

app/api/
├── health/route.ts                # GET /api/health
├── upload/resume/route.ts         # POST /api/upload/resume
├── resume/
│   ├── extract/route.ts           # POST /api/resume/extract
│   └── parse/route.ts             # POST /api/resume/parse
├── job/match/route.ts             # POST /api/job/match
└── ... (other endpoints)

supabase/migrations/
├── 001_init_schema.sql            # CREATE TABLE resumes
└── 002_add_raw_text_column.sql    # ALTER TABLE resumes ADD COLUMN raw_text

scripts/
├── integration-test-resume.sh     # Full integration test suite
├── test-resume-api.sh             # Simple upload + parse test
└── test-resume-parser.ts          # Unit tests for skill normalization
```

## Troubleshooting

### Resume Upload Fails with 415 Unsupported Media Type

**Cause**: File MIME type not recognized

**Solution**:
```bash
# Check file type
file -i ~/Desktop/resume.pdf

# Explicitly set MIME type in curl
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@resume.pdf;type=application/pdf"
```

### No Text Extracted from PDF

**Cause**: PDF is image-based or scanned

**Solution**: OCR is not supported. Recommend text-based PDFs.

**Check**: 
```bash
curl -X POST http://localhost:3000/api/resume/extract \
  -F "file=@resume.pdf" | jq '.warnings'
```

### 401 Unauthorized on Parse Endpoint

**Cause**: Not authenticated or session expired

**Solution**:
```bash
# Ensure browser has auth cookie set
# Or use job/match endpoint with direct skill arrays (no auth needed)
```

### Skills Not Matching Job Requirements

**Cause**: Skill name mismatch (different canonical form)

**Solution**:
```bash
# Check skill canonicalization
# In Node REPL or test script:
import { normalizeSkillsFromText } from '@/lib/skills/canonicalSkills'
normalizeSkillsFromText('nodejs, node js, nodejs, docker')
// → ["Node.js", "Docker"]
```

## Performance Considerations

**Text Extraction:**
- PDF (2MB): ~200-500ms
- DOCX (1MB): ~100-300ms
- Max file size: 10MB (configurable)

**Skill Normalization:**
- Average resume: ~50-200 detected skills
- Deduplication + canonicalization: <10ms
- Matching against 100 job skills: <5ms

**Database:**
- Resume insert: ~50ms
- Parse data update: ~100ms
- Query by ID + user: ~20ms (with index)

## Future Enhancements

Potential improvements (not required):

1. **Batch Processing**: `processResume()` already exists in ingestion.ts
2. **Resume Versioning**: Track multiple versions per user
3. **Skill Confidence Scores**: Add confidence ratings to detected skills
4. **Learning Paths**: Integration with learning resource recommendations
5. **Webhook Notifications**: Trigger updates on new job matches
6. **OCR Support**: For scanned/image-based PDFs
7. **Resume Templates**: Detect and score resume format quality

## References

### Related Documentation
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [pdf-parse NPM](https://www.npmjs.com/package/pdf-parse)
- [Mammoth.js Docs](https://github.com/mwilliamson/mammoth.js)

### Code Files
- Job Scraper: `/app/api/scrape/jobs/route.ts`
- Analysis Endpoint: `/app/api/analyze/route.ts`
- Skill Matching Tests: `/scripts/test-resume-parser.ts`
