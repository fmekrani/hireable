-- Add analysis_results column to user_analyses table
ALTER TABLE user_analyses
ADD COLUMN analysis_results jsonb;
