import crypto from 'crypto';

export function verifyMetaSignature(payload: string, signature: string, appSecret: string): boolean {
  if (!signature || !appSecret) return false;
  
  try {
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}
