import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export const MAX_ACTIVE_USERS = 5;
export const SESSION_TIMEOUT = 20 * 60; // 20 minutes in seconds
export const PORT = 8000;

// Redis setup
export const redis = new Redis();

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);