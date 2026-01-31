-- Supabase SQL Migration
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Resumes table
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  parsed_data jsonb,
  uploaded_at timestamp with time zone default now()
);

-- Job searches table
create table if not exists public.job_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text,
  job_title text,
  job_url text,
  job_data jsonb,
  search_date timestamp with time zone default now(),
  added_to_favorites boolean default false,
  unique(user_id, job_url)
);

-- Analysis runs table
create table if not exists public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  job_search_id uuid references public.job_searches(id) on delete set null,
  readiness_score float,
  matched_skills text[],
  missing_skills text[],
  weeks_to_learn int,
  recommendations jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  analysis_run_id uuid references public.analysis_runs(id) on delete cascade,
  messages jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_job_searches_user_id on public.job_searches(user_id);
create index if not exists idx_analysis_runs_user_id on public.analysis_runs(user_id);
create index if not exists idx_conversations_user_id on public.conversations(user_id);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.job_searches enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.conversations enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- RLS Policies for resumes table
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- RLS Policies for job_searches table
create policy "Users can view own searches"
  on public.job_searches for select
  using (auth.uid() = user_id);

create policy "Users can insert searches"
  on public.job_searches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own searches"
  on public.job_searches for update
  using (auth.uid() = user_id);

create policy "Users can delete own searches"
  on public.job_searches for delete
  using (auth.uid() = user_id);

-- RLS Policies for analysis_runs table
create policy "Users can view own analysis"
  on public.analysis_runs for select
  using (auth.uid() = user_id);

create policy "Users can insert analysis"
  on public.analysis_runs for insert
  with check (auth.uid() = user_id);

-- RLS Policies for conversations table
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);
-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();