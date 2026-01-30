# Supabase Backend Setup Guide

## Architecture Overview

```
Your App
├── Auth Layer (Supabase Auth)
│   ├── Email/Password
│   └── OAuth (Google, GitHub)
├── Database (PostgreSQL via Supabase)
│   ├── users (profile data)
│   ├── job_searches (searched jobs)
│   ├── resumes (uploaded resumes)
│   ├── analysis_runs (prediction history)
│   └── recommendations (saved recommendations)
├── Row Level Security (RLS)
│   └── Users can only access their own data
├── Storage (for PDFs)
│   └── user_resumes/{user_id}/
└── ML APIs (unchanged)
    ├── /api/predict
    ├── /api/analyze
    ├── /api/recommendations
    └── /api/chat
```

---

## Database Schema

### 1. Users Table (auto-created by Supabase Auth)
```sql
-- Extends Supabase auth.users
create table public.users (
  id uuid primary key references auth.users(id),
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### 2. Resumes Table
```sql
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_path text not null, -- storage path
  parsed_data jsonb, -- extracted resume content
  uploaded_at timestamp default now()
);
```

### 3. Job Searches Table
```sql
create table public.job_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text,
  job_title text,
  job_url text unique,
  job_data jsonb, -- full job posting
  search_date timestamp default now(),
  added_to_favorites boolean default false
);
```

### 4. Analysis Runs Table
```sql
create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  job_search_id uuid references public.job_searches(id) on delete set null,
  
  -- ML Model Predictions
  readiness_score float,
  matched_skills text[],
  missing_skills text[],
  weeks_to_learn int,
  
  -- Ollama LLM Output
  recommendations jsonb,
  
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### 5. Conversations Table (for chat history)
```sql
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete cascade,
  
  messages jsonb, -- array of {role, content, timestamp}
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

## Row Level Security (RLS) Policies

### For users table:
```sql
-- Users can view their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);
```

### For resumes table:
```sql
-- Users can only see their own resumes
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

-- Users can insert resumes
create policy "Users can upload resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

-- Users can delete their own resumes
create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);
```

### For job_searches table:
```sql
-- Users can see their own searches
create policy "Users can view own searches"
  on public.job_searches for select
  using (auth.uid() = user_id);

-- Users can insert searches
create policy "Users can insert searches"
  on public.job_searches for insert
  with check (auth.uid() = user_id);

-- Users can update their own searches
create policy "Users can update own searches"
  on public.job_searches for update
  using (auth.uid() = user_id);
```

### For analysis_runs table:
```sql
-- Users can see their own analysis
create policy "Users can view own analysis"
  on public.analysis_runs for select
  using (auth.uid() = user_id);

-- Users can insert analysis
create policy "Users can insert analysis"
  on public.analysis_runs for insert
  with check (auth.uid() = user_id);
```

---

## Storage Setup

### Create bucket for resumes:
```bash
# In Supabase dashboard or CLI
supabase storage create-bucket user_resumes --public false
```

### Storage RLS Policy:
```sql
-- Users can upload to their own folder
create policy "Users can upload resumes"
  on storage.objects for insert
  with check (bucket_id = 'user_resumes' and owner = auth.uid());

-- Users can download their own resumes
create policy "Users can download resumes"
  on storage.objects for select
  using (bucket_id = 'user_resumes' and owner = auth.uid());
```

---

## Implementation Steps

### Step 1: Create Supabase Project
- Go to supabase.com
- Create new project
- Get project URL and anon key

### Step 2: Add environment variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
```

### Step 3: Install Supabase client
```bash
npm install @supabase/supabase-js
```

### Step 4: Create auth middleware (Next.js)
- Protect routes requiring login
- Get current user

### Step 5: Integrate with existing APIs
- Add user_id to predictions
- Save analysis runs to DB
- Track job searches
- Store conversation history

### Step 6: Add auth UI
- Login page (email/password)
- Signup page
- OAuth buttons (Google, GitHub)
- User profile page

---

## API Changes Required

### `/api/predict` Enhancement
```typescript
// Add to request
{
  resume_id?: string,
  job_search_id?: string
}

// After prediction, save to analysis_runs table
```

### `/api/chat` Enhancement
```typescript
// Add conversation to conversations table
// Track chat history per analysis
```

### New `/api/job-searches`
```typescript
// POST - Save a job search
// GET - Get user's job searches
// PUT - Update (add to favorites, etc)
```

### New `/api/resumes`
```typescript
// GET - List user's resumes
// DELETE - Remove resume
// GET/:id - Get resume details
```

---

## Features This Enables

✅ **Multi-user system** - Each user isolated  
✅ **Job search history** - Track what they searched  
✅ **Analysis history** - See past predictions  
✅ **Resume management** - Multiple resumes  
✅ **Chat history** - Conversation persistence  
✅ **Favorites** - Save important searches  
✅ **PDF storage** - Secure resume storage  

---

## Ready to implement?

Steps:
1. Create Supabase project + get keys ✅
2. Add environment variables ✅
3. Install @supabase/supabase-js ✅
4. Create Supabase client module ✅
5. Build auth pages ✅
6. Add RLS policies ✅
7. Modify APIs to use Supabase ✅
8. Add job search tracking ✅

**Estimated time:** 2-3 hours
