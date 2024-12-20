import { supabase } from '../supabaseClient';
import { sessionStatus, queueInfo } from '../stores';
import { cleanupLocalData } from './cleanupService';
import { validateSchemas } from './schemaValidator';
import type { UserRecord } from './types';

export async function syncWithSupabase() {
    try {
        // Clean local data first
        await cleanupLocalData();
        
        // Validate schema
        const { isValid, error: schemaError } = await validateSchemas();
        if (!isValid) {
            throw new Error(schemaError || 'Schema validation failed');
        }

        // Get all users from Supabase
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) {
            throw new Error(`Failed to fetch users: ${usersError.message}`);
        }

        // Insert or update users in local table
        for (const user of users) {
            const { error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    is_active: user.is_active || false,
                    last_login: user.last_login,
                    session_started_at: user.session_started_at,
                    session_expires_at: user.session_expires_at
                });

            if (upsertError) {
                throw new Error(`Failed to sync user ${user.email}: ${upsertError.message}`);
            }
        }

        // Get current session if exists
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return resetStores();
        }

        // Get current user data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userError || !userData) {
            return resetStores();
        }

        // Update session status
        sessionStatus.set({
            isActive: userData.is_active || false,
            position: userData.queue_position || null,
            email: session.user.email
        });

        return { success: true };
    } catch (error: any) {
        console.error('Sync error:', error);
        throw new Error(`Synchronization failed: ${error.message}`);
    }
}

function resetStores() {
    sessionStatus.set({
        isActive: false,
        position: null,
        email: null
    });
    
    queueInfo.set({
        activeUsers: [],
        waitingQueue: [],
        maxUsers: 0
    });
    
    return { success: false };
}