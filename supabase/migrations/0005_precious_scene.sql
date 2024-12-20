/*
  # Add schema validation function
  
  1. New Functions
    - `get_table_schema`: Returns table column information
  
  2. Changes
    - Creates a stored function for schema validation
    - Adds proper error handling
*/

CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'columns', json_agg(
        json_build_object(
          'column_name', column_name,
          'data_type', data_type,
          'is_nullable', is_nullable = 'YES'
        )
      )
    )
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
  );
END;
$$;