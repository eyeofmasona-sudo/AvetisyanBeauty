const GRAPH_API_VERSION = 'v21.0';

export class MetaSendError extends Error {}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new MetaSendError('WhatsApp is not configured: missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
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
  const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!igAccountId || !accessToken) {
    throw new MetaSendError('Instagram is not configured: missing INSTAGRAM_ACCOUNT_ID or INSTAGRAM_PAGE_ACCESS_TOKEN');
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
