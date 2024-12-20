/*
  # Update users table RLS policies
  
  1. Security Changes
    - Add policy for user registration
    - Add policy for user updates
    - Maintain existing select policy
  
  2. Changes
    - Allow authenticated users to insert their own record
    - Allow authenticated users to update their own record
*/

-- Policy for inserting new users during registration
CREATE POLICY "Users can insert their own record"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy for updating user data
CREATE POLICY "Users can update their own record"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable authenticated users to update their status and last_login
CREATE POLICY "Users can update their status"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      is_active IS NOT NULL 
      OR last_login IS NOT NULL
    )
  );