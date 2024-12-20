/*
  # Fix user schema and authentication

  1. Changes
    - Remove password_hash column requirement since auth is handled by Supabase Auth
    - Add missing columns for user management
    
  2. Security
    - Update policies to work with Supabase Auth
*/

-- Remove password_hash constraint and add new columns
ALTER TABLE users 
  ALTER COLUMN password_hash DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS session_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS session_expires_at timestamptz;

-- Update policies for better security
CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);