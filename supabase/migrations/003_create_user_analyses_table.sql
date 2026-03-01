-- Create user_analyses table for storing job analyses
CREATE TABLE IF NOT EXISTS user_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  match_score INTEGER,
  job_url TEXT,
  job_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_analyses_user_id_idx ON user_analyses(user_id);
CREATE INDEX IF NOT EXISTS user_analyses_created_at_idx ON user_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own analyses
CREATE POLICY user_analyses_select_policy ON user_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: users can only insert their own analyses
CREATE POLICY user_analyses_insert_policy ON user_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: users can only delete their own analyses
CREATE POLICY user_analyses_delete_policy ON user_analyses
  FOR DELETE
  USING (auth.uid() = user_id);
