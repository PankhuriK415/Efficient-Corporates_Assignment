-- 1. Create the feedbacks table
CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow anyone to read feedbacks
CREATE POLICY "Allow public read access" 
ON feedbacks 
FOR SELECT 
USING (true);

-- 4. Create a policy to allow anyone to submit feedback
CREATE POLICY "Allow public insert access" 
ON feedbacks 
FOR INSERT 
WITH CHECK (true);

-- 5. Create an index for performance on created_at (since we sort by it)
CREATE INDEX idx_feedbacks_created_at ON feedbacks (created_at DESC);
