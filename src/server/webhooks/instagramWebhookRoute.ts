import { Router } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import type { GoogleGenAI } from '@google/genai';
import { verifyMetaSignature } from './metaSignatureVerification';
import { processIncomingMessage } from '../messaging/processIncoming';

export function createInstagramWebhookRoute(deps: { db: Firestore; getAi: () => GoogleGenAI }) {
  const router = Router();

  router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
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
        console.warn('Invalid Meta signature on Instagram Webhook');
        return;
      }
    }

    try {
      if (req.body?.object !== 'instagram' || !Array.isArray(req.body?.entry)) {
        return;
      }

      for (const entry of req.body.entry) {
        const messagingEvents = entry?.messaging;
        if (!Array.isArray(messagingEvents)) continue;

        for (const event of messagingEvents) {
          const text = event?.message?.text;
          const senderId = event?.sender?.id;
          // Echoes of our own outbound sends are also delivered here; skip them.
          if (!text || !senderId || event?.message?.is_echo) continue;

          processIncomingMessage(deps.db, deps.getAi(), {
            channel: 'instagram',
            external_thread_id: senderId,
            customer_name: senderId,
            customer_handle: senderId,
            text,
          }).catch((e) => console.error('Failed to process Instagram message:', e));
        }
      }
    } catch (e) {
      console.error('Error handling Instagram webhook payload:', e);
    }
  });

  return router;
}
