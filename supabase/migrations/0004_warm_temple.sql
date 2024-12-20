/*
  # Remove password_hash column
  
  1. Changes
    - Remove unnecessary password_hash column as passwords are handled by Supabase auth
  
  2. Security
    - No changes to security policies
*/

ALTER TABLE users 
  DROP COLUMN IF EXISTS password_hash;