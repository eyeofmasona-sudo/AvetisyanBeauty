import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 *
 * ⚠️  This key bypasses RLS — NEVER expose it to the browser.
 *     Only import this module from server-side code (server.ts, src/server/*).
 *
 * Used for:
 *   - admin writes to `site`, `ai_threads`, `ai_messages`, `ai_knowledge`
 *   - storage uploads/deletes on the `uploads` bucket
 *   - reading thread/message data needed by webhooks
 */

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn(
    '[supabase-admin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'Server-side DB/storage operations will fail until env is configured.'
  );
}

export const supabaseAdmin: SupabaseClient = createClient(
  url || 'http://localhost:54321',
  serviceRoleKey || 'service-role-key-placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
