/*
  # Create feedback table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `emoji` (text, not null) - The emoji selected by user
      - `emotion` (text, not null) - The emotion name/description
      - `comment` (text, nullable) - Optional user comment
      - `post_id` (text, nullable) - Optional post identifier for blog integration
      - `created_at` (timestamptz) - Timestamp when feedback was created

  2. Security
    - Enable RLS on `feedback` table
    - Add policy for public read access to feedback data
    - Add policy for public insert access to allow anonymous feedback submission
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji text NOT NULL,
  emotion text NOT NULL,
  comment text,
  post_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public read access to feedback data for statistics
CREATE POLICY "Allow public read access to feedback"
  ON feedback
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access for anonymous feedback submission
CREATE POLICY "Allow public insert access to feedback"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);