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
 *
 * The client is created lazily on first access so that dotenv.config()
 * (called in server.ts) has a chance to populate process.env before the
 * client reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
 */

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn(
      '[supabase-admin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Server-side DB/storage operations will fail until env is configured.'
    );
  }

  _client = createClient(
    url || 'http://localhost:54321',
    serviceRoleKey || 'service-role-key-placeholder',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return _client;
}

// Proxy that forwards all property access to the lazily-created client.
// This way existing code can keep using `supabaseAdmin.from(...)` /
// `supabaseAdmin.storage...` without change.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
