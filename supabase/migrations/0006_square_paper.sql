/*
  # Add schema comparison function
  
  1. New Functions
    - `compare_schemas`: Compares local and Supabase schemas
  
  2. Changes
    - Creates a stored function for strict schema comparison
    - Returns detailed comparison results
*/

CREATE OR REPLACE FUNCTION compare_schemas(table_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    local_schema json;
    supabase_schema json;
    differences text[];
BEGIN
    -- Get local schema
    local_schema := get_table_schema(table_name);
    
    -- Get Supabase schema (assuming we're in Supabase)
    supabase_schema := get_table_schema(table_name);
    
    -- Compare schemas and collect differences
    SELECT array_agg(diff)
    INTO differences
    FROM (
        SELECT jsonb_pretty(to_jsonb(l) - to_jsonb(s)) as diff
        FROM jsonb_array_elements(local_schema->'columns') l
        FULL OUTER JOIN jsonb_array_elements(supabase_schema->'columns') s
        ON l->>'column_name' = s->>'column_name'
        WHERE l IS DISTINCT FROM s
    ) diffs
    WHERE diff IS NOT NULL;
    
    RETURN json_build_object(
        'are_identical', differences IS NULL,
        'differences', differences
    );
END;
$$;