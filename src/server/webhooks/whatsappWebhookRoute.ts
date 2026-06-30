import { Router } from 'express';
import type { GoogleGenAI } from '@google/genai';
import { verifyMetaSignature } from './metaSignatureVerification';
import { processIncomingMessage } from '../messaging/processIncoming';

export function createWhatsappWebhookRoute(deps: { getAi: () => GoogleGenAI }) {
  const router = Router();

  router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  router.post('/', (req, res) => {
    // Always acknowledge quickly; Meta retries aggressively on non-200 responses.
    res.status(200).send('EVENT_RECEIVED');

    if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
      return;
    }

    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBody = (req as any).rawBody;

    if (rawBody && process.env.META_APP_SECRET) {
      const isValid = verifyMetaSignature(rawBody, signature, process.env.META_APP_SECRET);
      if (!isValid) {
        console.warn('Invalid Meta signature on WhatsApp Webhook');
        return;
      }
    }

    try {
      const entries = req.body?.entry;
      if (!Array.isArray(entries)) return;

      for (const entry of entries) {
        const changes = entry?.changes;
        if (!Array.isArray(changes)) continue;

        for (const change of changes) {
          const value = change?.value;
          const messages = value?.messages;
          if (!Array.isArray(messages)) continue;

          const contacts = value?.contacts || [];

          for (const message of messages) {
            if (message?.type !== 'text' || !message?.text?.body) continue;
            const from = message.from as string;
            const contact = contacts.find((c: any) => c.wa_id === from);
            const customerName = contact?.profile?.name || from;

            processIncomingMessage(deps.getAi(), {
              channel: 'whatsapp',
              external_thread_id: from,
              customer_name: customerName,
              customer_handle: from,
              text: message.text.body,
            }).catch((e) => console.error('Failed to process WhatsApp message:', e));
          }
        }
      }
    } catch (e) {
      console.error('Error handling WhatsApp webhook payload:', e);
    }
  });

  return router;
}
