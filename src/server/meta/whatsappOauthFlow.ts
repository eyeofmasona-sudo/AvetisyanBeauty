import { encryptToken } from '../lib/crypto.js';

const GRAPH_API_VERSION = 'v21.0';

/**
 * Required Meta permissions for WhatsApp Cloud API integration via Embedded Signup.
 * - whatsapp_business_management: manage WABA, phone numbers, templates
 * - whatsapp_business_messaging: send messages
 * - business_management: list businesses the user manages
 */
export const WHATSAPP_REQUIRED_SCOPES = [
  'whatsapp_business_management',
  'whatsapp_business_messaging',
  'business_management',
];

export interface WhatsAppOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export function getWhatsAppOAuthConfig(): WhatsAppOAuthConfig {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_WHATSAPP_REDIRECT_URI || process.env.META_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      'META_APP_ID, META_APP_SECRET, and META_WHATSAPP_REDIRECT_URI (or META_REDIRECT_URI) ' +
      'environment variables must be set.'
    );
  }
  return { appId, appSecret, redirectUri };
}

export function isWhatsAppOAuthConfigured(): boolean {
  try {
    getWhatsAppOAuthConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the Facebook OAuth dialog URL for WhatsApp Embedded Signup.
 * The response_type=code is the standard OAuth flow (the JS SDK FB.login
 * approach is heavier and requires a popup; server-side redirect is simpler).
 */
export function buildWhatsAppAuthUrl(state: string): string {
  const { appId, redirectUri } = getWhatsAppOAuthConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: WHATSAPP_REQUIRED_SCOPES.join(','),
    auth_type: 'rerequest',
  });
  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/** Exchange the OAuth code for a short-lived user access token. */
export async function exchangeCodeForShortLivedToken(code: string): Promise<string> {
  const { appId, appSecret, redirectUri } = getWhatsAppOAuthConfig();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    let msg = `Token exchange failed (${res.status})`;
    try {
      const j = JSON.parse(body);
      if (j?.error?.message) msg += `: ${j.error.message}`;
    } catch {
      msg += `: ${body.slice(0, 200)}`;
    }
    throw new Error(msg);
  }
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Token exchange returned no access_token: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.access_token as string;
}

/** Inspect a token to learn its expiry + scopes. */
export async function inspectToken(token: string): Promise<{
  scopes: string[];
  expiresAt: Date | null;
  isValid: boolean;
}> {
  const { appId, appSecret } = getWhatsAppOAuthConfig();
  const url = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${appId}|${appSecret}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { scopes: [], expiresAt: null, isValid: false };
  }
  const data = await res.json();
  const d = data?.data || {};
  const expiresAt = d.expires_at ? new Date(d.expires_at * 1000) : null;
  return {
    scopes: d.scopes || [],
    expiresAt,
    isValid: d.is_valid === true,
  };
}

/** Exchange a short-lived user token for a long-lived one (~60 days). */
export async function exchangeForLongLivedToken(shortLived: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const { appId, appSecret } = getWhatsAppOAuthConfig();
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLived,
  });
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    let msg = `Long-lived token exchange failed (${res.status})`;
    try {
      const j = JSON.parse(body);
      if (j?.error?.message) msg += `: ${j.error.message}`;
    } catch {
      msg += `: ${body.slice(0, 200)}`;
    }
    throw new Error(msg);
  }
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Long-lived exchange returned no access_token: ${JSON.stringify(data).slice(0, 200)}`);
  }
  const expiresIn = (data.expires_in as number) || 60 * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  return { accessToken: data.access_token, expiresAt };
}

export interface WhatsAppBusinessAccount {
  id: string;
  name?: string;
  currency?: string;
  message_template_namespace?: string;
}

/**
 * Fetch the WhatsApp Business Accounts the user manages.
 *
 * The /me/businesses endpoint returns the user's businesses, and each business
 * has owned_whatsapp_business_accounts. We flatten this into a single list.
 */
export async function fetchWhatsAppBusinessAccounts(userAccessToken: string): Promise<{
  businesses: Array<{ id: string; name: string }>;
  wabas: Array<{ businessId: string; businessName: string; waba: WhatsAppBusinessAccount }>;
}> {
  // Step 1: list businesses
  const bizUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/businesses?fields=id,name&access_token=${encodeURIComponent(userAccessToken)}`;
  const bizRes = await fetch(bizUrl);
  if (!bizRes.ok) {
    const body = await bizRes.text();
    throw new Error(`Failed to fetch businesses (${bizRes.status}): ${body.slice(0, 200)}`);
  }
  const bizData = await bizRes.json();
  const businesses: Array<{ id: string; name: string }> = (bizData.data || []).map((b: any) => ({
    id: b.id,
    name: b.name || '(unnamed business)',
  }));

  // Step 2: for each business, list its WABAs
  const wabas: Array<{ businessId: string; businessName: string; waba: WhatsAppBusinessAccount }> = [];
  await Promise.all(
    businesses.map(async (biz) => {
      const wabaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${biz.id}/owned_whatsapp_business_accounts?fields=id,name,currency,message_template_namespace&access_token=${encodeURIComponent(userAccessToken)}`;
      const wabaRes = await fetch(wabaUrl);
      if (!wabaRes.ok) return;
      const wabaData = await wabaRes.json();
      for (const w of (wabaData.data || []) as any[]) {
        wabas.push({
          businessId: biz.id,
          businessName: biz.name,
          waba: {
            id: w.id,
            name: w.name,
            currency: w.currency,
            message_template_namespace: w.message_template_namespace,
          },
        });
      }
    })
  );

  return { businesses, wabas };
}

export interface WhatsAppPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating?: string;
  code_verification_status?: string;
}

/**
 * Fetch the phone numbers attached to a WhatsApp Business Account.
 * Each phone number has its own ID (used as the sender when sending messages).
 */
export async function fetchPhoneNumbers(
  wabaId: string,
  userAccessToken: string
): Promise<WhatsAppPhoneNumber[]> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status&access_token=${encodeURIComponent(userAccessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch phone numbers (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.data || []) as WhatsAppPhoneNumber[];
}

/**
 * Subscribe the app to receive webhooks for this WABA + phone number.
 *
 * Two-step process per Meta docs:
 *   1. POST /{waba_id}/subscribed_apps  — register the app for WABA events
 *   2. POST /{phone_number_id}/subscribed_apps — register for phone-specific events
 *
 * The webhook callback URL + verify_token must already be configured in the
 * Meta App Dashboard (Facebook Login → Webhooks) OR set programmatically
 * via the WhatsApp Business Management API. We assume the admin has set the
 * callback URL in the dashboard.
 */
export async function subscribeAppToWaba(
  wabaId: string,
  phone_number_id: string,
  userAccessToken: string
): Promise<{ wabaSubscribed: boolean; phoneSubscribed: boolean; errors: string[] }> {
  const errors: string[] = [];
  let wabaSubscribed = false;
  let phoneSubscribed = false;

  // Step 1: subscribe to WABA-level events
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/subscribed_apps`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAccessToken}` },
      }
    );
    if (res.ok) {
      wabaSubscribed = true;
    } else {
      const body = await res.text();
      let msg = `WABA subscribe failed (${res.status})`;
      try {
        const j = JSON.parse(body);
        if (j?.error?.message) msg += `: ${j.error.message}`;
      } catch {
        msg += `: ${body.slice(0, 200)}`;
      }
      errors.push(msg);
    }
  } catch (e: any) {
    errors.push(`WABA subscribe exception: ${e.message}`);
  }

  // Step 2: subscribe to phone-number-level events
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phone_number_id}/subscribed_apps`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAccessToken}` },
      }
    );
    if (res.ok) {
      phoneSubscribed = true;
    } else {
      const body = await res.text();
      let msg = `Phone subscribe failed (${res.status})`;
      try {
        const j = JSON.parse(body);
        if (j?.error?.message) msg += `: ${j.error.message}`;
      } catch {
        msg += `: ${body.slice(0, 200)}`;
      }
      errors.push(msg);
    }
  } catch (e: any) {
    errors.push(`Phone subscribe exception: ${e.message}`);
  }

  return { wabaSubscribed, phoneSubscribed, errors };
}

/**
 * Send a text message via WhatsApp Cloud API.
 * Returns the message id assigned by Meta.
 */
export async function sendWhatsAppTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<string> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
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
    const body = await res.text();
    let msg = `WhatsApp send failed (${res.status})`;
    try {
      const j = JSON.parse(body);
      if (j?.error?.message) msg += `: ${j.error.message}`;
    } catch {
      msg += `: ${body.slice(0, 200)}`;
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.messages?.[0]?.id || 'unknown';
}

/**
 * Build a complete integration record from a WABA + phone number + user token.
 * Token is encrypted before returning — safe to insert directly into the DB.
 */
export interface WhatsAppIntegrationRecord {
  meta_business_id: string;
  whatsapp_business_account_id: string;
  whatsapp_phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  access_token_encrypted: string;
  token_expires_at: string;       // ISO string
  granted_scopes: string[];
}

export async function buildWhatsAppIntegrationRecord(
  businessId: string,
  waba: WhatsAppBusinessAccount,
  phone: WhatsAppPhoneNumber,
  userLongLivedToken: string,
  grantedScopes: string[]
): Promise<WhatsAppIntegrationRecord> {
  const expiresIn = 60 * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    meta_business_id: businessId,
    whatsapp_business_account_id: waba.id,
    whatsapp_phone_number_id: phone.id,
    display_phone_number: phone.display_phone_number,
    verified_name: phone.verified_name,
    access_token_encrypted: encryptToken(userLongLivedToken),
    token_expires_at: expiresAt.toISOString(),
    granted_scopes: grantedScopes,
  };
}
