import { supabase } from '../supabaseClient';

export async function createUserRecord(userId: string, email: string) {
    const { error } = await supabase
        .from('users')
        .insert([{
            id: userId,
            email,
            created_at: new Date().toISOString()
        }]);
    
    return { error };
}

export async function updateLastLogin(userId: string) {
    const { error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    
    return { error };
}