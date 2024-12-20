/*
  # Fix schema comparison function
  
  1. Changes
    - Drop existing function first to avoid parameter name conflict
    - Recreate function with improved schema comparison logic
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS compare_schemas(text);

-- Create new function
CREATE FUNCTION compare_schemas(table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    schema_data json;
BEGIN
    -- Get schema information
    SELECT json_agg(
        json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable = 'YES',
            'column_default', c.column_default
        )
        ORDER BY c.ordinal_position
    )
    INTO schema_data
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = table_name;

    IF schema_data IS NULL THEN
        RETURN json_build_object(
            'are_identical', false,
            'error', 'Table not found: ' || table_name
        );
    END IF;

    RETURN json_build_object(
        'are_identical', true,
        'schema', schema_data
    );
END;
$$;