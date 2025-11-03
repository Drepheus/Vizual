-- Add api_logs table for tracking API usage
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own logs
CREATE POLICY "Users can view own api logs"
  ON api_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Add web_searches column to usage_tracking table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usage_tracking' AND column_name = 'web_searches'
  ) THEN
    ALTER TABLE usage_tracking ADD COLUMN web_searches INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update subscription tier limits (optional - for documentation)
COMMENT ON COLUMN usage_tracking.web_searches IS 'AI Web Task usage count. Limits: Free=0, Pro=10, Ultra=50 per month';
