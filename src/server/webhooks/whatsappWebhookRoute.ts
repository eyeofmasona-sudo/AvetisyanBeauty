import { Router } from 'express';
import { verifyMetaSignature } from './metaSignatureVerification';

export const whatsappWebhookRoute = Router();

whatsappWebhookRoute.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

whatsappWebhookRoute.post('/', (req, res) => {
  if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
    return res.status(200).send("EVENT_RECEIVED_AI_DISABLED");
  }

  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = (req as any).rawBody;
  
  if (rawBody && process.env.META_APP_SECRET) {
    const isValid = verifyMetaSignature(rawBody, signature, process.env.META_APP_SECRET);
    if (!isValid) {
      console.warn("Invalid Meta signature on WhatsApp Webhook");
      return res.sendStatus(401);
    }
  }

  console.log("WhatsApp Webhook Received:", req.body);
  
  // Here we would route the message to the AI Assistant logic
  
  res.status(200).send("EVENT_RECEIVED");
});
