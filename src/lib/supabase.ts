import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client.
 *
 * Uses the anon (public) key. RLS policies on the Postgres tables enforce:
 *   - public read on `site`, `ai_knowledge`
 *   - admin-only read/write on `ai_threads`, `ai_messages`
 *   - public read on `uploads` storage bucket
 *
 * All admin writes go through the Express server (`/api/db/*`, `/api/upload`)
 * which uses the service role key and bypasses RLS — see
 * `src/server/lib/supabaseAdmin.ts`.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Realtime and direct reads will fail silently until env is configured.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);
