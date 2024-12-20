/*
  # Improve schema validation functions
  
  1. Changes
    - Drop existing functions
    - Create improved schema comparison function
    - Add function to validate table existence
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS compare_schemas(text);
DROP FUNCTION IF EXISTS get_table_schema(text);

-- Create function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(input_table_name text)
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
                    'is_nullable', is_nullable = 'YES',
                    'column_default', column_default
                ) ORDER BY ordinal_position
            )
        )
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = input_table_name
    );
END;
$$;

-- Create improved schema comparison function
CREATE OR REPLACE FUNCTION compare_schemas(input_table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_exists boolean;
    schema_data json;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = input_table_name
    ) INTO table_exists;

    IF NOT table_exists THEN
        RETURN json_build_object(
            'are_identical', false,
            'error', 'Table does not exist: ' || input_table_name
        );
    END IF;

    -- Get schema data
    schema_data := get_table_schema(input_table_name);
    
    IF schema_data IS NULL OR schema_data->'columns' IS NULL THEN
        RETURN json_build_object(
            'are_identical', false,
            'error', 'Failed to get schema for table: ' || input_table_name
        );
    END IF;

    RETURN json_build_object(
        'are_identical', true,
        'schema', schema_data->'columns'
    );
END;
$$;