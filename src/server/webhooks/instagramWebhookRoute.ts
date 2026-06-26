import { Router } from 'express';
import { verifyMetaSignature } from './metaSignatureVerification';

export const instagramWebhookRoute = Router();

instagramWebhookRoute.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

instagramWebhookRoute.post('/', (req, res) => {
  if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
    return res.status(200).send("EVENT_RECEIVED_AI_DISABLED");
  }

  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = (req as any).rawBody; // Assumes raw body is available
  
  if (rawBody && process.env.META_APP_SECRET) {
    const isValid = verifyMetaSignature(rawBody, signature, process.env.META_APP_SECRET);
    if (!isValid) {
      console.warn("Invalid Meta signature on Instagram Webhook");
      return res.sendStatus(401);
    }
  }

  console.log("Instagram Webhook Received:", JSON.stringify(req.body, null, 2));
  
  if (req.body.object === 'instagram' && Array.isArray(req.body.entry)) {
    req.body.entry.forEach((entry: any) => {
      const accountId = entry.id;
      // TODO: Map accountId to stored accounts and route appropriately
      console.log(`Processing webhook entry for account: ${accountId}`);
      // Here we would route the message to the AI Assistant logic for this specific account
    });
  } else {
    // Legacy fallback or unknown format
    console.log("Processing legacy or non-standard webhook format");
  }
  
  res.status(200).send("EVENT_RECEIVED");
});
