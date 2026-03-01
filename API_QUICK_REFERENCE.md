# Resume Scraper API Quick Reference

## Installation & Setup

```bash
# Dependencies already in package.json:
# - pdf-parse: PDF text extraction
# - mammoth: DOCX/DOC text extraction
# - @supabase/supabase-js: Database + Storage

npm install
npm run dev
```

## 5 Main Endpoints

### 1. Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "message": "Backend is running",
  "timestamp": "2026-03-01T12:00:00Z"
}
```

---

### 2. Upload Resume + Parse

```bash
POST /api/upload/resume
Content-Type: multipart/form-data

file: <binary PDF/DOCX/DOC>
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/upload/resume \
  -F "file=@./resume.pdf"
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
    "rawText": "Full extracted text...",
    "skills": ["Python", "SQL", "Docker"],
    "tech_stack": ["Python", "SQL"],
    "metadata": { ... }
  }
}
```

**Error Responses:**
- 400: Unsupported file type
- 413: File too large (>10MB)
- 415: Invalid MIME type
- 401: Not authenticated
- 500: Server error

---

### 3. Extract Resume Text (No Save)

```bash
POST /api/resume/extract
Content-Type: multipart/form-data

file: <binary PDF/DOCX/DOC>
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/resume/extract \
  -F "file=@./resume.pdf"
```

**Response (200):**
```json
{
  "success": true,
  "text": "Extracted resume text...",
  "skills": ["Python", "SQL", "Docker"],
  "tech_stack": ["Python", "SQL"],
  "fileName": "resume.pdf",
  "fileSize": 245621,
  "pageCount": 2,
  "warnings": []
}
```

**Notes:**
- No authentication required
- Doesn't save to database
- Good for preview UI

---

### 4. Re-Parse Stored Resume

```bash
POST /api/resume/parse
Content-Type: application/json

{
  "resume_id": "uuid-string"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/resume/parse \
  -H "Content-Type: application/json" \
  -d '{"resume_id":"550e8400-e29b-41d4-a716-446655440000"}'
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

**Error Responses:**
- 400: Missing resume_id
- 401: Unauthorized
- 404: Resume not found
- 500: Parsing failed

---

### 5. Match Resume vs Job Skills

**Option A: Direct Skill Arrays** (no auth)

```bash
POST /api/job/match
Content-Type: application/json

{
  "resume_skills": ["Python", "SQL", "Docker", "AWS"],
  "job_skills": ["Python", "Docker", "Kubernetes", "GCP"]
}
```

**Option B: From Stored Resume** (requires auth)

```bash
POST /api/job/match
Content-Type: application/json

{
  "resume_id": "uuid-string",
  "job_skills": ["Python", "Docker", "Kubernetes"]
}
```

**cURL Examples:**
```bash
# Option A
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume_skills": ["Python", "SQL", "Docker"],
    "job_skills": ["Python", "Docker", "Kubernetes"]
  }'

# Option B
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
  "missing_skills": ["Kubernetes"],
  "match_percentage": 67,
  "details": {
    "matched_count": 2,
    "missing_count": 1,
    "total_job_skills": 3,
    "match_score": "67%",
    "ready_to_apply": true,
    "learning_priority": ["Kubernetes"]
  }
}
```

**Error Responses:**
- 400: Missing required fields
- 401: Unauthorized (resume_id only)
- 404: Resume not found (resume_id only)
- 500: Server error

---

## Integration Example

```typescript
// 1. Upload resume
const uploadResponse = await fetch('/api/upload/resume', {
  method: 'POST',
  body: formData // File from <input type="file">
})
const { resume_id, resume } = await uploadResponse.json()

// 2. User finds a job posting
const jobSkills = ['Python', 'Docker', 'Kubernetes']

// 3. Match resume against job
const matchResponse = await fetch('/api/job/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resume_id, job_skills: jobSkills })
})
const { matched_skills, missing_skills, match_percentage } = await matchResponse.json()

// 4. Show user results
console.log(`You match ${match_percentage}% of requirements`)
console.log(`Missing: ${missing_skills.join(', ')}`)
```

---

## Database Schema

```sql
-- Resumes table (auto-created by migration)
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,  -- "user_id/timestamp-filename.pdf"
  raw_text text,             -- Full extracted text
  parsed_data jsonb,         -- { skills: [...], metadata: {...} }
  uploaded_at timestamp DEFAULT now(),
  parsed_at timestamp
);

-- Storage path: resumes/{user_id}/{timestamp}-{filename}
-- Example: resumes/550e8400.../1709312400000-resume.pdf
```

---

## Testing

### Run All Tests

```bash
npm run dev  # Terminal 1
bash scripts/integration-test-resume.sh  # Terminal 2
```

### Test Individual Endpoints

```bash
# Health check
curl http://localhost:3000/api/health | jq '.'

# Test upload availability
curl http://localhost:3000/api/upload/resume | jq '.'

# Test skill matching (no file needed)
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{
    "resume_skills": ["Python"],
    "job_skills": ["Python", "Docker"]
  }' | jq '.'

# Test error handling
curl -X POST http://localhost:3000/api/job/match \
  -H "Content-Type: application/json" \
  -d '{"resume_skills": ["Python"]}' # Missing job_skills
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/app/api/health/route.ts` | Health check |
| `/app/api/upload/resume/route.ts` | Upload + parse + store |
| `/app/api/resume/extract/route.ts` | Extract text only |
| `/app/api/resume/parse/route.ts` | Re-parse by ID |
| `/app/api/job/match/route.ts` | Skill matching |
| `/lib/resume/services/resume-scraper.ts` | Core service |
| `/lib/skills/canonicalSkills.ts` | Skill normalization |
| `/scripts/integration-test-resume.sh` | Test suite |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (not authenticated) |
| 404 | Not found (resume doesn't exist) |
| 413 | Payload too large (file too big) |
| 415 | Unsupported media type (file type not allowed) |
| 500 | Server error |

---

## Common Errors & Solutions

**"File too large"**
- Max: 10MB (error 413)
- Solution: Compress PDF or use smaller file

**"Unsupported file type"**
- Supported: .pdf, .docx, .doc (error 415)
- Solution: Use one of these formats

**"Unauthorized"**
- Error 401 on parse/match with resume_id
- Solution: User must be authenticated
- Workaround: Use direct skill arrays for job/match (no auth)

**"No text extracted"**
- Warning: PDF may be image-based or scanned
- Solution: OCR not supported; provide text-based PDF

**"Skill not matching"**
- Cause: Canonicalization difference
- Example: "nodejs" should match "Node.js"
- Solution: See `/lib/skills/canonicalSkills.ts` for alias mapping

---

## Documentation Links

- **Full API Guide**: `/BACKEND_IMPLEMENTATION.md`
- **Architecture**: `/RESUME_PARSING_README.md`
- **Implementation Summary**: `/IMPLEMENTATION_SUMMARY.md`
- **Integration Tests**: `/scripts/integration-test-resume.sh`

---

## Skill Canonicalization Examples

```
Input → Output
───────────────────────────
nodejs → Node.js
node.js → Node.js
NodeJS → Node.js

powerbi → Power BI
PowerBI → Power BI
pbi → Power BI

mssql → SQL Server
sql server → SQL Server

kubernetes → Kubernetes
k8s → Kubernetes

typescript → TypeScript
ts → TypeScript
```

Full mapping: `/lib/skills/canonicalSkills.ts`

---

## Environment Variables Required

```bash
# .env.local (inherited from Supabase project)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

No new environment variables needed.

---

## Performance Notes

| Operation | Time |
|-----------|------|
| Health check | <10ms |
| PDF text extraction (2MB) | 200-500ms |
| DOCX extraction (1MB) | 100-300ms |
| Skill normalization | <10ms |
| Skill matching | <5ms |
| Database insert | ~50ms |

---

## Support

**Questions?** Check these in order:
1. `/BACKEND_IMPLEMENTATION.md` - Comprehensive guide with troubleshooting
2. `/scripts/integration-test-resume.sh` - See all working tests
3. `curl` the endpoints with `-v` flag to see request/response detail
4. Check `/app/api/*/route.ts` files for comments explaining integration points
