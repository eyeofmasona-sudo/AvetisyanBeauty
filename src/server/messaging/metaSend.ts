import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const GRAPH_API_VERSION = 'v21.0';

export class MetaSendError extends Error {}

/**
 * Cached Meta credentials loaded from Supabase (public.site / key=meta_credentials).
 * Refreshed every 60 seconds so admin updates in the panel take effect without
 * a server restart. Falls back to process.env for backward compatibility.
 */
interface MetaCreds {
  meta_app_secret?: string;
  meta_verify_token?: string;
  whatsapp_verify_token?: string;
  whatsapp_phone_number_id?: string;
  whatsapp_access_token?: string;
  instagram_account_id?: string;
  instagram_page_access_token?: string;
}

let _cachedCreds: MetaCreds | null = null;
let _cachedAt = 0;
const CACHE_TTL_MS = 60_000;

async function getMetaCreds(): Promise<MetaCreds> {
  const now = Date.now();
  if (_cachedCreds && now - _cachedAt < CACHE_TTL_MS) {
    return _cachedCreds;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('site')
      .select('data')
      .eq('key', 'meta_credentials')
      .maybeSingle();
    if (!error && data?.data) {
      _cachedCreds = data.data as MetaCreds;
    } else {
      _cachedCreds = {};
    }
  } catch (e) {
    _cachedCreds = {};
  }
  _cachedAt = now;
  return _cachedCreds;
}

/** Returns the value of a Meta credential, preferring DB over env. */
async function getCred(key: keyof MetaCreds, envKey: string): Promise<string | undefined> {
  const creds = await getMetaCreds();
  return (creds[key] as string) || process.env[envKey];
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  const phoneNumberId = await getCred('whatsapp_phone_number_id', 'WHATSAPP_PHONE_NUMBER_ID');
  const accessToken = await getCred('whatsapp_access_token', 'WHATSAPP_ACCESS_TOKEN');
  if (!phoneNumberId || !accessToken) {
    throw new MetaSendError(
      'WhatsApp is not configured: missing whatsapp_phone_number_id or whatsapp_access_token. ' +
      'Set them in the admin panel → AI Assistant → Settings → Connect WhatsApp & Instagram.'
    );
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new MetaSendError(`WhatsApp send failed (${res.status}): ${body}`);
  }
}

export async function sendInstagramText(recipientId: string, text: string): Promise<void> {
  const igAccountId = await getCred('instagram_account_id', 'INSTAGRAM_ACCOUNT_ID');
  const accessToken = await getCred('instagram_page_access_token', 'INSTAGRAM_PAGE_ACCESS_TOKEN');
  if (!igAccountId || !accessToken) {
    throw new MetaSendError(
      'Instagram is not configured: missing instagram_account_id or instagram_page_access_token. ' +
      'Set them in the admin panel → AI Assistant → Settings → Connect WhatsApp & Instagram.'
    );
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${igAccountId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new MetaSendError(`Instagram send failed (${res.status}): ${body}`);
  }
}

/** Returns the cached META_APP_SECRET (used by webhooks to verify signatures). */
export async function getMetaAppSecret(): Promise<string | undefined> {
  return getCred('meta_app_secret', 'META_APP_SECRET');
}
