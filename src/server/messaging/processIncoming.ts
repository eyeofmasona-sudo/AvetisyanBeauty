import type { GoogleGenAI } from '@google/genai';
import { draftAIReply } from './aiDraft';
import { addInboundMessage, findOrCreateThread, getAISettings, getActiveKnowledgeBase, markMessageAnswered } from './threadStore';
import { sendInstagramText, sendWhatsAppText, MetaSendError } from './metaSend';
import type { Channel } from './threadStore';

const AUTO_REPLY_CONFIDENCE_THRESHOLD = 0.75;

export interface IncomingMessage {
  channel: Channel;
  external_thread_id: string;
  customer_name: string;
  customer_handle: string;
  text: string;
}

export async function processIncomingMessage(
  ai: GoogleGenAI,
  incoming: IncomingMessage
): Promise<void> {
  const settings = await getAISettings();

  const threadId = await findOrCreateThread({
    channel: incoming.channel,
    external_thread_id: incoming.external_thread_id,
    customer_name: incoming.customer_name,
    customer_handle: incoming.customer_handle,
    language: 'unknown',
  });

  if (!settings.is_enabled) {
    await addInboundMessage(threadId, {
      channel: incoming.channel,
      original_text: incoming.text,
      status: 'needs_human',
      requires_human: true,
    });
    return;
  }

  const knowledgeBase = await getActiveKnowledgeBase();
  const draft = await draftAIReply(ai, incoming.text, knowledgeBase as any);
  const confidencePct = Math.round(draft.confidence * 100);

  let status: 'new' | 'needs_human' | 'answered' = draft.requires_human ? 'needs_human' : 'new';

  const messageId = await addInboundMessage(threadId, {
    channel: incoming.channel,
    original_text: incoming.text,
    detected_language: draft.detected_language,
    ai_suggested_reply: draft.suggested_reply || undefined,
    confidence: confidencePct,
    status,
    requires_human: draft.requires_human,
  });

  const shouldAutoSend =
    settings.mode === 'auto_reply' &&
    !draft.requires_human &&
    draft.confidence >= AUTO_REPLY_CONFIDENCE_THRESHOLD &&
    draft.suggested_reply;

  if (shouldAutoSend) {
    try {
      if (incoming.channel === 'whatsapp') {
        await sendWhatsAppText(incoming.customer_handle, draft.suggested_reply);
      } else {
        await sendInstagramText(incoming.customer_handle, draft.suggested_reply);
      }
      await markMessageAnswered(threadId, messageId, draft.suggested_reply);
    } catch (e) {
      if (e instanceof MetaSendError) {
        console.error('Auto-reply send failed (likely missing Meta credentials):', e.message);
      } else {
        console.error('Auto-reply send failed:', e);
      }
      // Leave the message in its drafted status so an admin can send it manually.
    }
  }
}
