// Database types for Supabase
export type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Resume = {
  id: string
  user_id: string
  file_name: string
  file_path: string
  parsed_data?: any
  uploaded_at: string
}

export type JobSearch = {
  id: string
  user_id: string
  company_name?: string
  job_title?: string
  job_url?: string
  job_data?: any
  search_date: string
  added_to_favorites: boolean
}

export type AnalysisRun = {
  id: string
  user_id: string
  resume_id?: string
  job_search_id?: string
  readiness_score: number
  matched_skills: string[]
  missing_skills: string[]
  weeks_to_learn: number
  recommendations?: any
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  user_id: string
  analysis_run_id?: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}
