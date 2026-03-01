# Hireable 🚀

A modern, AI-powered job readiness analysis platform that helps professionals assess how ready they are for specific job opportunities.

## ✨ Features

- **Job Analysis**: Upload your resume and job posting to get a readiness score
- **Skill Matching**: Automatic skill extraction and comparison
- **Personalized Timeline**: Get weeks-to-learn estimates for missing skills
- **AI Recommendations**: Personalized improvement suggestions
- **User Dashboard**: Track your analysis history and progress
- **Secure Authentication**: Email/password and OAuth (Google, GitHub)
- **Multi-User Support**: Complete data isolation with Row Level Security

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.10
- **UI**: React 19.2.4 with TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.19
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with JWT
- **APIs**: RESTful endpoints with OAuth2 support
- **Resume Parsing**: PDF (via pdf-parse) & DOCX (via mammoth)
- **Skill Matching**: Shared canonicalization logic with job scraper

### ML/AI
- **Model Framework**: TensorFlow 2.20.0
- **Language**: Python 3.9.6
- **LLM**: Mistral 7B (via Ollama on localhost:11434)

## 📚 Documentation

### Backend Implementation Guides
- **[Backend Implementation Guide](./BACKEND_IMPLEMENTATION.md)** - Complete API documentation, database schema, and integration guide (500+ lines)
- **[API Quick Reference](./API_QUICK_REFERENCE.md)** - Developer quick-start with cURL examples for all 5 endpoints
- **[Complete File Manifest](./COMPLETE_FILE_MANIFEST.md)** - Detailed checklist of all changes and test results
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Executive summary and compliance verification

### System Guides
- **[Resume Parsing README](./RESUME_PARSING_README.md)** - Resume parsing architecture and usage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Ollama (for LLM, optional)
- Supabase account (for database and auth)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (.env.local)
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

3. **Run Supabase migrations**
   - Go to your Supabase dashboard
   - Run the SQL from `supabase/migrations/001_init_schema.sql`

4. **Train the ML model** (optional)
   ```bash
   python3 train_model.py
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Access the app at `http://localhost:3000`

## 📁 Project Structure

```
hireable/
├── app/                           # Next.js app directory
│   ├── page.tsx                   # Landing page
│   ├── auth/                      # Authentication routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx         # User dashboard
│   ├── profile/page.tsx           # User profile
│   ├── api/                       # API routes
│   │   ├── predict/route.ts       # ML inference API
│   │   └── chat/route.ts          # LLM chat API
│   └── layout.tsx
├── lib/                           # Utilities and helpers
│   ├── supabase/                  # Supabase clients and auth
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   ├── auth-context.tsx       # Auth provider
│   │   └── types.ts
│   ├── ml/                        # ML utilities
│   │   ├── featureExtraction.ts
│   │   ├── recommendations.ts
│   │   └── resume/parse.ts
├── components/                    # React components
│   ├── ui/                        # Reusable UI components
│   ├── layout/                    # Layout components
│   ├── intro/                     # Landing page sections
│   ├── analyze/                   # Analysis components
│   └── chat/                      # Chat components
├── middleware.ts                  # Protected routes
├── models/                        # Trained TensorFlow models
├── scripts/                       # Utility scripts
│   └── predict.py                 # ML inference script
├── supabase/                      # Database migrations
│   └── migrations/
│       └── 001_init_schema.sql
├── package.json
└── tsconfig.json
```

## 🔐 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `full_name` (String)
- `avatar_url` (String)
- `created_at` (Timestamp)

### Resumes Table
- `id` (UUID)
- `user_id` (UUID, Foreign Key)
- `file_name` (String)
- `file_path` (String)
- `parsed_data` (JSON)
- `uploaded_at` (Timestamp)

### Analysis Runs Table
- `id` (UUID)
- `user_id` (UUID, Foreign Key)
- `readiness_score` (Float 0-1)
- `matched_skills` (Array)
- `missing_skills` (Array)
- `weeks_to_learn` (Int)
- `recommendations` (JSON)
- `created_at` (Timestamp)

### Conversations Table
- `id` (UUID)
- `user_id` (UUID, Foreign Key)
- `analysis_run_id` (UUID)
- `messages` (JSON Array)
- `created_at` (Timestamp)

## 🔒 Security

- **Row Level Security (RLS)**: All tables have RLS policies ensuring users only see their own data
- **JWT Authentication**: Secure token-based auth via Supabase
- **Protected Routes**: Middleware validates auth before accessing protected pages
- **Admin Client**: Separate admin Supabase client for server-side operations

## 📊 ML Pipeline

1. **Feature Extraction**: 90 numerical features from resume and job data
2. **Model Inference**: TensorFlow trained on ~500 resume-job pairs
3. **Skill Matching**: Calculates matched and missing skills
4. **Timeline Estimation**: Predicts weeks needed to learn each skill
5. **Recommendations**: LLM generates personalized improvement tips

### Sample API Request

```bash
POST /api/predict
Content-Type: application/json

{
  "resume": {
    "skills": ["Python", "React", "Node.js"],
    "yearsExperience": 3,
    "education": "BS Computer Science"
  },
  "job": {
    "title": "Full-Stack Developer",
    "requiredSkills": ["Python", "React", "PostgreSQL"],
    "yearsRequired": "2-3 years"
  },
  "userId": "user-uuid"
}
```

### Sample API Response

```json
{
  "success": true,
  "data": {
    "readiness": 75,
    "matchedSkills": ["Python", "React"],
    "missingSkills": ["PostgreSQL"],
    "timeline": [
      { "skill": "PostgreSQL", "weeks": 4 }
    ],
    "recommendations": [
      "Master PostgreSQL with online courses",
      "Build 2-3 projects using PostgreSQL"
    ],
    "analysisId": "analysis-uuid"
  }
}
```

## 🧪 Testing

### Verify Database Connection
```bash
# Check if migrations ran successfully
curl -H "Authorization: Bearer $SUPABASE_TOKEN" https://your-supabase-url/rest/v1/users
```

### Test ML Model
```bash
python3 scripts/predict.py '{"features": [...]}'
```

### Test Auth Flow
1. Visit `/auth/signup` and create an account
2. Verify email (or skip if email confirmation is disabled)
3. Login with credentials
4. Access `/dashboard` to verify auth middleware

### Integration Test Suite (Resume Scraper)

Full end-to-end testing of resume upload, parsing, and skill matching:

```bash
# Start dev server first
npm run dev

# In another terminal, run integration tests
bash scripts/integration-test-resume.sh

# Test with a specific resume file
bash scripts/integration-test-resume.sh /path/to/resume.pdf

# Test with custom API endpoint
BASE_URL=http://localhost:3001 bash scripts/integration-test-resume.sh
```

The integration test suite checks:
- ✅ Server health status
- ✅ Resume upload API availability
- ✅ Resume extract API (text extraction)
- ✅ Resume parse API (re-parsing stored resumes)
- ✅ Job match API (skill overlap calculation)
- ✅ Skill matching with direct arrays
- ✅ Error handling and validation
- ✅ Resume text extraction from actual files

### Manual Resume API Test
```bash
# Using the provided test script
npm run dev:resume-api-test -- /absolute/path/to/resume.pdf

# Or manual curl commands
curl -X POST http://localhost:3000/api/resume/extract \
  -F "file=@/path/to/resume.pdf" | jq '.'
```

## Resume Parsing API

### Upload + Parse + Store

`POST /api/upload/resume` (multipart form-data)

Request fields:
- `file`: PDF, DOCX, or DOC (max 10MB)

Response shape:
```json
{
  "success": true,
  "resume_id": "uuid",
  "resume": {
    "file_name": "resume.pdf",
    "skills": ["Node.js", "SQL", "Power BI"]
  },
  "resume_data": {
    "rawText": "...",
    "skills": ["Node.js", "SQL", "Power BI"],
    "tech_stack": ["SQL"],
    "metadata": {
      "fileType": ".pdf",
      "wordCount": 512
    }
  },
  "error": null
}
```

### Parse Existing Stored Resume

`POST /api/resume/parse` with JSON body:
```json
{ "resume_id": "uuid" }
```

This endpoint verifies ownership, downloads from Supabase Storage bucket `resumes`, extracts full text, normalizes skills using the same canonical logic as job scraping, and stores `raw_text` + `parsed_data`.

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel deploy
```

Make sure to set environment variables in Vercel dashboard.

## 📝 Development Notes

- **Auth Context**: Global state managed via `AuthProvider` - wrap app in `lib/supabase/auth-context.tsx`
- **Protected Routes**: Middleware.ts protects `/dashboard`, `/profile`, and other auth-required routes
- **ML Model**: Requires Python 3.9+ with TensorFlow installed
- **Ollama**: Optional for LLM features; defaults to Ollama on localhost:11434

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

## 📄 License

MIT License - See LICENSE file for details

## 💡 Future Enhancements

- [ ] Resume parsing improvements
- [ ] Advanced job description parsing
- [ ] Interview question generation
- [ ] Video upload for portfolio
- [ ] Network connection features
- [ ] Analytics dashboard
- [ ] Mobile app

---

**Made with ❤️ for job seekers everywhere**
