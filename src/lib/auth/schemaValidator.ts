import { supabase } from '../supabaseClient';

export async function validateSchemas(): Promise<{ isValid: boolean; error?: string }> {
    try {
        // Compare schemas using the RPC function
        const { data, error } = await supabase
            .rpc('compare_schemas', { 
                input_table_name: 'users'
            });

        if (error) {
            console.error('Schema comparison error:', error);
            throw new Error(`Schema validation failed: ${error.message}`);
        }

        if (!data.are_identical) {
            const errorMsg = data.error || 'Local and remote schemas do not match';
            throw new Error(errorMsg);
        }

        return { isValid: true };
    } catch (error: any) {
        console.error('Schema validation error:', error);
        return {
            isValid: false,
            error: `Database synchronization failed: ${error.message}`
        };
    }
}