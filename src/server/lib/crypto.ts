import crypto from 'crypto';

/**
 * Server-side AES-256-GCM encryption for sensitive tokens (Meta access tokens,
 * Instagram long-lived tokens, etc.).
 *
 * Key derivation:
 *   1. META_TOKEN_ENCRYPTION_KEY (preferred — dedicated key)
 *   2. APP_SECRET (fallback — already used for the legacy Instagram token file)
 *   3. JWT_SECRET (last resort — better than nothing in dev)
 *
 * The derived 32-byte key is SHA-256 of the source. Ciphertext format:
 *   <iv_hex>:<authTag_hex>:<encrypted_hex>
 *
 * NEVER expose this module to the browser. Import only from server-side code.
 */

let _key: Buffer | null = null;

function getKey(): Buffer {
  if (_key) return _key;
  const source =
    process.env.META_TOKEN_ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-insecure-key-do-not-use-in-production';
  if (!process.env.META_TOKEN_ENCRYPTION_KEY && !process.env.APP_SECRET) {
    console.warn(
      '[crypto] META_TOKEN_ENCRYPTION_KEY or APP_SECRET not set — using fallback key. ' +
      'Tokens will not be decryptable across restarts in production.'
    );
  }
  _key = crypto.createHash('sha256').update(source).digest();
  return _key;
}

const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM

export function encryptToken(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(ciphertext: string): string | null {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('[crypto] decryptToken failed:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Generate a random hex string suitable for OAuth state parameter. */
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}
