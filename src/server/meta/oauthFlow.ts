import { encryptToken } from '../lib/crypto.js';

const GRAPH_API_VERSION = 'v21.0';

/**
 * Required Meta permissions for Instagram + WhatsApp integration.
 * - instagram_basic: read IG profile + media
 * - pages_show_list: list FB pages
 * - pages_read_engagement: read page conversations
 * - pages_manage_metadata: subscribe to messaging webhooks
 * - instagram_manage_messages: read/send IG Direct messages
 * - pages_messaging: send messages on behalf of page (legacy name)
 */
export const REQUIRED_SCOPES = [
  'instagram_basic',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_metadata',
  'instagram_manage_messages',
  'pages_messaging',
];

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export function getMetaOAuthConfig(): MetaOAuthConfig {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      'META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI environment variables must be set. ' +
      'Get them from https://developers.facebook.com/apps → your app → Settings → Basic.'
    );
  }
  return { appId, appSecret, redirectUri };
}

export function isMetaOAuthConfigured(): boolean {
  try {
    getMetaOAuthConfig();
    return true;
  } catch {
    return false;
  }
}

/** Builds the Facebook OAuth dialog URL the user will be redirected to. */
export function buildAuthUrl(state: string): string {
  const { appId, redirectUri } = getMetaOAuthConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: REQUIRED_SCOPES.join(','),
    auth_type: 'rerequest',
  });
  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/** Exchange the OAuth code for a short-lived user access token. */
export async function exchangeCodeForShortLivedToken(code: string): Promise<string> {
  const { appId, appSecret, redirectUri } = getMetaOAuthConfig();
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

/** Inspect a short-lived token to learn its expiry + scopes. */
export async function inspectToken(token: string): Promise<{
  scopes: string[];
  expiresAt: Date | null;
  isValid: boolean;
}> {
  const { appId, appSecret } = getMetaOAuthConfig();
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
  const { appId, appSecret } = getMetaOAuthConfig();
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

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
  instagram_business_account?: { id: string };
}

/** Fetch the list of Facebook Pages the user manages. */
export async function fetchFacebookPages(userAccessToken: string): Promise<FacebookPage[]> {
  const fields = 'id,name,access_token,category,tasks,instagram_business_account';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/me/accounts?fields=${fields}&access_token=${encodeURIComponent(userAccessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch Facebook pages (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.data || []) as FacebookPage[];
}

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

/** Fetch the IG Business Account details for a page (returns null if not linked). */
export async function fetchInstagramAccount(page: FacebookPage): Promise<InstagramAccount | null> {
  if (!page.instagram_business_account?.id) return null;
  const fields = 'id,username,name,profile_picture_url,followers_count,media_count';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${page.instagram_business_account.id}?fields=${fields}&access_token=${encodeURIComponent(page.access_token)}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('[meta/oauth] Failed to fetch IG account:', await res.text());
    return null;
  }
  return (await res.json()) as InstagramAccount;
}

export interface InstagramMedia {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  permalink: string;
  timestamp: string;
}

/** Fetch the latest N posts/reels from an IG Business Account. */
export async function fetchInstagramMedia(
  igAccountId: string,
  pageAccessToken: string,
  limit = 24
): Promise<InstagramMedia[]> {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${igAccountId}/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(pageAccessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch IG media (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.data || []) as InstagramMedia[];
}

/**
 * Result of completing the OAuth flow for a single page.
 * Token is already encrypted — safe to insert directly into the DB.
 */
export interface IntegrationRecord {
  facebook_page_id: string;
  facebook_page_name: string;
  instagram_account_id: string | null;
  instagram_username: string | null;
  instagram_profile_pic: string | null;
  access_token_encrypted: string;
  token_expires_at: string;       // ISO string
  granted_scopes: string[];
}

/** Build a complete IntegrationRecord from a Facebook page + user token. */
export async function buildIntegrationRecord(
  page: FacebookPage,
  userLongLivedToken: string,
  grantedScopes: string[]
): Promise<IntegrationRecord> {
  const igAccount = await fetchInstagramAccount(page);

  const expiresIn = 60 * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  return {
    facebook_page_id: page.id,
    facebook_page_name: page.name,
    instagram_account_id: igAccount?.id || null,
    instagram_username: igAccount?.username || null,
    instagram_profile_pic: igAccount?.profile_picture_url || null,
    access_token_encrypted: encryptToken(page.access_token || userLongLivedToken),
    token_expires_at: expiresAt.toISOString(),
    granted_scopes: grantedScopes,
  };
}
