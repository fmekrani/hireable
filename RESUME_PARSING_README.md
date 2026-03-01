# Resume Parsing and Skill Normalization System

## Overview

This system extracts text and skills from uploaded PDF resumes, normalizes skills to match the job scraper's canonical format, and stores results in Supabase.

## Architecture

### Key Components

1. **Resume Upload** (`/app/api/upload/resume/route.ts`)
   - Accepts PDF files via multipart form data
   - Calls Python PDF parser to extract raw text
   - Returns immediate parse result
   - Stores file metadata in `public.resumes` table

2. **Skill Canonicalization** (`/lib/skills/canonicalSkills.ts`)
   - Unified module used by both job scraper and resume parser
   - Maps skill aliases to canonical names
   - Whitelists skills to prevent false positives
   - Used by both:
     - Job web scraper (`/lib/scraper/extractSkills.ts`)
     - Resume parser (`/lib/resume/parse.ts`)

3. **Resume Parse Endpoint** (`/api/resume/parse/route.ts`)
   - Takes `resume_id` of already-uploaded resume
   - Downloads file from Supabase Storage bucket `resumes`
   - Extracts text using Python script
   - Normalizes skills to canonical format
   - Stores `raw_text` and `parsed_data` in database
   - Returns structured JSON response

4. **Skills Matching** (`/lib/skills/matching.ts`)
   - Compares resume skills vs. job requirements
   - Estimates learning time for missing skills
   - Provides human-readable recommendations

### Database Schema

**Table: `public.resumes`**
```sql
id                uuid (primary key)
user_id           uuid (references users)
file_name         text (e.g., "resume.pdf")
file_path         text (path in Supabase Storage)
raw_text          text (full extracted text)
parsed_data       jsonb (structured parse result)
uploaded_at       timestamp
parsed_at         timestamp (when skills were normalized)
```

**Storage Bucket: `resumes`**
- Stores PDF files
- Path: `{user_id}/{file_name}`
- Accessed via Supabase client

### Response Schema

All endpoints return success/error responses. Successful parse response:

```json
{
  "success": true,
  "resume_id": "uuid",
  "resume": {
    "file_name": "resume.pdf",
    "skills": ["Python", "SQL", "JavaScript"],
    "years_experience": 5,
    "seniority": "Mid",
    "domain": "Backend"
  },
  "resume_data": {
    "file_name": "resume.pdf",
    "raw_text_length": 8234,
    "raw_text_preview": "...",
    "skills": ["Python", "SQL", "JavaScript"],
    "tech_stack": ["Python", "SQL", "JavaScript"],
    "years_experience": 5,
    "seniority": "Mid",
    "domain": "Backend",
    "education": "Bachelor",
    "meta": {
      "extractedWith": "pdfplumber",
      "confidence": {
        "skills": 0.85,
        "yearsExperience": 0.9
      }
    },
    "parsed_at": "2026-03-01T12:00:00Z",
    "source": "resume_parse_v1"
  }
}
```

## Usage

### 1. Upload Resume

```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@./my-resume.pdf"
```

Response includes `parsed_data` from initial parsing.

### 2. Store Raw Text and Normalize Skills

```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Requires authentication** - sends current user ID via session.

### 3. Match Resume to Job

```typescript
import { fullSkillAssessment } from '@/lib/skills/matching'

const assessment = fullSkillAssessment(
  resumeSkills, // from /api/resume/parse
  jobRequiredSkills, // from /api/job/scrape
  jobPreferredSkills // optional
)

// Returns:
// {
//   matched: ["Python", "SQL"],
//   missing: ["TypeScript", "Docker"],
//   matchPercentage: 67,
//   preferred: { matched: [...], missing: [...] },
//   estimatedWeeksToLearn: 3,
//   overallRecommendation: "..."
// }
```

## Implementation Notes

### Canonical Skill Format

Both systems use the same skill canonicalization:

- **Source**: `SKILL_DICTIONARY` from `/lib/resume/skillDictionary.ts`
- **Mapping**: Aliases → Canonical names (e.g., "NodeJS" → "Node.js", "postgres" → "PostgreSQL")
- **Case-insensitive** matching with word boundaries
- **Whitelist filtering** to prevent false positives (no "CSS" from "discuss", no "Go" from "Google")
- **Sorted alphabetically** for consistent output

### Word Boundary Handling

Special cases for ambiguous short skills:
- "Go" - avoids matching "Google", "Googlier"
- "R" - avoids matching "are", "for", "career"

### Storage Integration

Uses existing Supabase patterns:
- Server-side client from `/lib/supabase/server.ts`
- RLS policies ensure users can only access their own resumes
- Storage bucket configured with same client

### Python Text Extraction

- Reuses script from `/scripts/pdf_parser.py`
- Runs via `execFile` with 10MB buffer limit
- Returns `{ rawText, pages, error }`
- Saves temp files to `/tmp` and cleans up

## Files Created/Modified

**Created:**
- `/lib/skills/canonicalSkills.ts` - Unified skill normalization
- `/lib/skills/matching.ts` - Resume-to-job matching logic
- `/app/api/resume/parse/route.ts` - Parse endpoint

**Modified:**
- `/supabase/migrations/001_init_schema.sql` - Added `raw_text` and `parsed_at` columns to `resumes` table

**Already Existing (Used):**
- `/app/api/upload/resume/route.ts` - Resume upload
- `/lib/resume/parse.ts` - Resume text parsing
- `/lib/resume/skillDictionary.ts` - Skill mappings
- `/scripts/pdf_parser.py` - PDF text extraction
- `/lib/supabase/server.ts` - Database client

## Testing

### Manual Test Flow

```bash
# 1. Start dev server
npm run dev

# 2. Upload resume (no auth required for testing)
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@./test-resume.pdf"
# Note: Extract resume_id from response

# 3. Parse and store raw text with skill normalization
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-auth-token=YOUR_TOKEN" \
  -d '{"resume_id":"550e8400-e29b-41d4-a716-446655440000"}'

# 4. Verify in database
# SELECT raw_text, parsed_data->>'skills' FROM public.resumes 
# WHERE id = '550e8400-e29b-41d4-a716-446655440000'

# 5. Scrape a job
curl -X POST http://localhost:3000/api/job/scrape \
  -H "Content-Type: application/json" \
  -d '{"jobUrl":"https://job-boards.greenhouse.io/tatari/jobs/8443708002"}'

# 6. Compare skills (in TypeScript)
import { fullSkillAssessment } from '@/lib/skills/matching'
const result = fullSkillAssessment(resumeSkills, jobSkills)
console.log(result.recommendation)
```

### Expected Results

- Resume parse should normalize skills (e.g., "nodejs" → "Node.js")
- Tech stack extraction filters to programming languages only
- Skill matching should work across both job and resume formats
- Database stores both raw text and parsed JSON

## Future Enhancements

1. Support DOCX resume files (currently PDF only)
2. Caching of parsed results to avoid re-parsing
3. Skill proficiency levels (basic/intermediate/expert)
4. Resume ranking for given job criteria
5. Automatic resume optimization suggestions
