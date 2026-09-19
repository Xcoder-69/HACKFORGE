// Supabase Client Initializer with Offline/Demo Resilience
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// Create client if configured, otherwise null
let _supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[SupabaseClient] Initialization warning:', err);
  }
} else {
  // Graceful development/offline notice
  console.info(
    '[SupabaseClient] Running in Offline-First / Local Storage mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect live cloud backend.'
  );
}

export const supabase = _supabase;
