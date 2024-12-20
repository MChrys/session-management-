import { supabase } from '../supabaseClient';

export async function cleanupLocalData() {
    try {
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Sign out from Supabase to clear auth state
        await supabase.auth.signOut();
        
        // Clear any IndexedDB data
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
            if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
    }
}