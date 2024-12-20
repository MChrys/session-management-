import { cleanupLocalData } from './cleanupService';
import { syncWithSupabase } from './syncService';

export async function resetDatabase() {
    try {
        await cleanupLocalData();
        await syncWithSupabase();
        return { success: true };
    } catch (error) {
        console.error('Reset error:', error);
        throw new Error('Failed to reset database');
    }
}