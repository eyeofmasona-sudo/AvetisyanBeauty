import type { Firestore } from 'firebase-admin/firestore';

export type Channel = 'instagram' | 'whatsapp';
export type AIStatus = 'new' | 'answered' | 'needs_human' | 'booked' | 'ignored';
export type AIMode = 'draft_only' | 'approval_required' | 'auto_reply';

export interface AIAssistantSettings {
  is_enabled: boolean;
  mode: AIMode;
  working_hours: string;
  fallback_message_hy: string;
  fallback_message_ru: string;
  fallback_message_en: string;
  max_reply_length: number;
}

const DEFAULT_SETTINGS: AIAssistantSettings = {
  is_enabled: true,
  mode: 'approval_required',
  working_hours: '10:00-20:00',
  fallback_message_hy: 'Ձեր հարցը կփոխանցեմ ադմինիստրատորին։',
  fallback_message_ru: 'Передам ваш вопрос администратору.',
  fallback_message_en: 'I will forward your question to the administrator.',
  max_reply_length: 500,
};

export async function getAISettings(db: Firestore): Promise<AIAssistantSettings> {
  const snap = await db.collection('site').doc('ai_settings').get();
  if (!snap.exists) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<AIAssistantSettings>) };
}

export async function getActiveKnowledgeBase(db: Firestore) {
  const snap = await db.collection('ai_knowledge').where('is_active', '==', true).get();
  return snap.docs.map((d) => d.data());
}

export async function findOrCreateThread(
  db: Firestore,
  params: {
    channel: Channel;
    external_thread_id: string;
    customer_name: string;
    customer_handle: string;
    language: 'hy' | 'ru' | 'en' | 'unknown';
  }
): Promise<string> {
  const existing = await db
    .collection('ai_threads')
    .where('channel', '==', params.channel)
    .where('external_thread_id', '==', params.external_thread_id)
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const now = Date.now();
  const docRef = await db.collection('ai_threads').add({
    channel: params.channel,
    external_thread_id: params.external_thread_id,
    customer_name: params.customer_name,
    customer_handle: params.customer_handle,
    language: params.language,
    status: 'new' as AIStatus,
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
}

export async function addInboundMessage(
  db: Firestore,
  threadId: string,
  params: {
    channel: Channel;
    original_text: string;
    detected_language?: 'hy' | 'ru' | 'en' | 'unknown';
    ai_suggested_reply?: string;
    confidence?: number;
    status: AIStatus;
    requires_human: boolean;
  }
): Promise<string> {
  const now = Date.now();
  const msgRef = await db.collection('ai_threads').doc(threadId).collection('messages').add({
    thread_id: threadId,
    direction: 'inbound',
    channel: params.channel,
    original_text: params.original_text,
    detected_language: params.detected_language,
    ai_suggested_reply: params.ai_suggested_reply,
    confidence: params.confidence,
    status: params.status,
    requires_human: params.requires_human,
    created_at: now,
  });
  await db.collection('ai_threads').doc(threadId).update({ status: params.status, updated_at: now });
  return msgRef.id;
}

export async function markMessageAnswered(
  db: Firestore,
  threadId: string,
  messageId: string,
  finalReply: string
): Promise<void> {
  const now = Date.now();
  await db.collection('ai_threads').doc(threadId).collection('messages').doc(messageId).update({
    status: 'answered',
    final_reply: finalReply,
  });
  await db.collection('ai_threads').doc(threadId).update({ status: 'answered', updated_at: now });
}

export async function getThread(db: Firestore, threadId: string) {
  const snap = await db.collection('ai_threads').doc(threadId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Record<string, any>;
}
