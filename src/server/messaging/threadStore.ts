import { supabaseAdmin } from '../lib/supabaseAdmin.js';

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

export async function getAISettings(): Promise<AIAssistantSettings> {
  const { data, error } = await supabaseAdmin
    .from('site')
    .select('data')
    .eq('key', 'ai_settings')
    .maybeSingle();

  if (error) {
    console.error('[threadStore] getAISettings error:', error);
    return DEFAULT_SETTINGS;
  }
  if (!data?.data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(data.data as Partial<AIAssistantSettings>) };
}

export async function getActiveKnowledgeBase() {
  const { data, error } = await supabaseAdmin
    .from('ai_knowledge')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('[threadStore] getActiveKnowledgeBase error:', error);
    return [];
  }
  return data || [];
}

export async function findOrCreateThread(
  params: {
    channel: Channel;
    external_thread_id: string;
    customer_name: string;
    customer_handle: string;
    language: 'hy' | 'ru' | 'en' | 'unknown';
  }
): Promise<string> {
  // Try to find an existing thread by (channel, external_thread_id).
  const { data: existing, error: findErr } = await supabaseAdmin
    .from('ai_threads')
    .select('id')
    .eq('channel', params.channel)
    .eq('external_thread_id', params.external_thread_id)
    .limit(1)
    .maybeSingle();

  if (findErr) {
    console.error('[threadStore] findOrCreateThread (find) error:', findErr);
    throw findErr;
  }
  if (existing?.id) return existing.id;

  // Insert a new thread. The unique index on (channel, external_thread_id)
  // protects against races between concurrent webhooks; on conflict, refetch.
  const now = Date.now();
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('ai_threads')
    .insert({
      channel: params.channel,
      external_thread_id: params.external_thread_id,
      customer_name: params.customer_name,
      customer_handle: params.customer_handle,
      language: params.language,
      status: 'new',
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (insertErr) {
    // Race-condition fallback: another worker inserted between our SELECT
    // and INSERT. Refetch.
    if (insertErr.code === '23505') {
      const { data: refetch, error: refetchErr } = await supabaseAdmin
        .from('ai_threads')
        .select('id')
        .eq('channel', params.channel)
        .eq('external_thread_id', params.external_thread_id)
        .limit(1)
        .single();
      if (refetchErr || !refetch?.id) {
        throw refetchErr || new Error('Failed to fetch thread after race condition');
      }
      return refetch.id;
    }
    throw insertErr;
  }
  return inserted.id;
}

export async function addInboundMessage(
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
  const { data, error } = await supabaseAdmin
    .from('ai_messages')
    .insert({
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
    })
    .select('id')
    .single();

  if (error) {
    console.error('[threadStore] addInboundMessage error:', error);
    throw error;
  }

  // Bump the thread's status + updated_at so it surfaces to the top of the inbox.
  await supabaseAdmin
    .from('ai_threads')
    .update({ status: params.status, updated_at: now })
    .eq('id', threadId);

  return data.id;
}

export async function markMessageAnswered(
  threadId: string,
  messageId: string,
  finalReply: string
): Promise<void> {
  const now = Date.now();
  const { error: msgErr } = await supabaseAdmin
    .from('ai_messages')
    .update({ status: 'answered', final_reply: finalReply })
    .eq('id', messageId);

  if (msgErr) {
    console.error('[threadStore] markMessageAnswered (message) error:', msgErr);
    throw msgErr;
  }

  const { error: threadErr } = await supabaseAdmin
    .from('ai_threads')
    .update({ status: 'answered', updated_at: now })
    .eq('id', threadId);

  if (threadErr) {
    console.error('[threadStore] markMessageAnswered (thread) error:', threadErr);
    throw threadErr;
  }
}

export async function getThread(threadId: string) {
  const { data, error } = await supabaseAdmin
    .from('ai_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();

  if (error) {
    console.error('[threadStore] getThread error:', error);
    return null;
  }
  if (!data) return null;
  return { id: data.id, ...data } as Record<string, any>;
}
