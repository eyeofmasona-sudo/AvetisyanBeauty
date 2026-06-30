import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type AIStatus = 'new' | 'answered' | 'needs_human' | 'booked' | 'ignored';
export type AIMode = 'draft_only' | 'approval_required' | 'auto_reply';
export type Channel = 'instagram' | 'whatsapp';

export interface AIKnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer_hy: string;
  answer_ru: string;
  answer_en: string;
  service_slug?: string;
  is_active: boolean;
  requires_human_review: boolean;
  created_at: number;
  updated_at: number;
}

export interface AIMessage {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  channel: Channel;
  original_text: string;
  detected_language?: 'hy' | 'ru' | 'en' | 'unknown';
  ai_suggested_reply?: string;
  final_reply?: string;
  status: AIStatus;
  confidence?: number;
  requires_human: boolean;
  created_at: number;
}

export interface AIThread {
  id: string;
  channel: Channel;
  external_thread_id: string;
  customer_name: string;
  customer_handle: string;
  language: 'hy' | 'ru' | 'en' | 'unknown';
  status: AIStatus;
  assigned_to?: string;
  messages: AIMessage[];
  created_at: number;
  updated_at: number;
}

export interface AIAssistantSettings {
  is_enabled: boolean;
  mode: AIMode;
  working_hours: string;
  fallback_message_hy: string;
  fallback_message_ru: string;
  fallback_message_en: string;
  max_reply_length: number;
}

export interface AIReplyTemplate {
  id: string;
  intent: string;
  title: string;
  template_hy: string;
  template_ru: string;
  template_en: string;
  is_active: boolean;
}

/**
 * Meta (Facebook Business) credentials needed for WhatsApp Business API and
 * Instagram Messaging API webhooks. Stored as encrypted JSON in the `site`
 * table under key 'meta_credentials'. The server uses these at runtime to:
 *   - verify incoming webhook signatures (META_APP_SECRET)
 *   - send outbound replies (WHATSAPP_ACCESS_TOKEN, INSTAGRAM_PAGE_ACCESS_TOKEN)
 *   - look up phone number ID / Instagram account ID
 *
 * The user enters these in the admin panel → AI Assistant → Settings →
 * "Connect WhatsApp & Instagram" section.
 */
export interface MetaCredentials {
  meta_app_secret: string;
  meta_verify_token: string;
  whatsapp_verify_token: string;
  whatsapp_phone_number_id: string;
  whatsapp_access_token: string;
  instagram_account_id: string;
  instagram_page_access_token: string;
}

interface AIAssistantState {
  settings: AIAssistantSettings;
  knowledgeBase: AIKnowledgeItem[];
  threads: AIThread[];
  templates: AIReplyTemplate[];

  updateSettings: (settings: Partial<AIAssistantSettings>) => Promise<void>;
  addKnowledgeItem: (item: Omit<AIKnowledgeItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateKnowledgeItem: (id: string, item: Partial<AIKnowledgeItem>) => Promise<void>;
  deleteKnowledgeItem: (id: string) => Promise<void>;

  updateMessageStatus: (threadId: string, messageId: string, status: AIStatus, requires_human?: boolean) => Promise<void>;
  sendReply: (threadId: string, messageId: string, finalReply: string) => Promise<void>;

  addTemplate: (template: Omit<AIReplyTemplate, 'id'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<AIReplyTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Meta (WhatsApp + Instagram) credentials for AI messaging webhooks
  metaCredentials: MetaCredentials | null;
  saveMetaCredentials: (creds: Partial<MetaCredentials>) => Promise<void>;

  subscribeAIData: () => () => void;
}

const defaultSettings: AIAssistantSettings = {
  is_enabled: true,
  mode: 'approval_required',
  working_hours: '10:00-20:00',
  fallback_message_hy: 'Ձեր հարցը կփոխանցեմ ադմինիստրատորին։',
  fallback_message_ru: 'Передам ваш вопрос администратору.',
  fallback_message_en: 'I will forward your question to the administrator.',
  max_reply_length: 500,
};

const defaultTemplates: AIReplyTemplate[] = [
  {
    id: 't1',
    intent: 'price_question',
    title: 'Узнать цену',
    template_hy: 'Այս պրոցեդուրայի արժեքն է...',
    template_ru: 'Стоимость данной процедуры составляет...',
    template_en: 'The cost of this procedure is...',
    is_active: true
  }
];

// Helper: read a single site row by key.
async function fetchSiteRow<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('site')
    .select('data')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.error(`[aiAssistantStore] Error fetching site/${key}:`, error);
    return null;
  }
  return (data?.data as T) ?? null;
}

// Helper: write settings through the admin-only API (server uses service role key).
async function saveAISettings(settings: AIAssistantSettings) {
  const res = await fetch('/api/db/site/ai_settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save AI settings');
}

export const useAIAssistantStore = create<AIAssistantState>()((set, get) => ({
  settings: defaultSettings,
  knowledgeBase: [],
  threads: [],
  templates: defaultTemplates,
  metaCredentials: null,

  updateSettings: async (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    await saveAISettings(settings);
  },

  addKnowledgeItem: async (item) => {
    const res = await fetch('/api/ai-messaging/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add knowledge item');
  },

  updateKnowledgeItem: async (id, item) => {
    const res = await fetch(`/api/ai-messaging/knowledge/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update knowledge item');
  },

  deleteKnowledgeItem: async (id) => {
    const res = await fetch(`/api/ai-messaging/knowledge/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete knowledge item');
  },

  updateMessageStatus: async (threadId, messageId, status, requires_human) => {
    const res = await fetch(`/api/ai-messaging/threads/${threadId}/messages/${messageId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, requires_human }),
    });
    if (!res.ok) throw new Error('Failed to update message status');
  },

  sendReply: async (threadId, messageId, finalReply) => {
    const res = await fetch('/api/ai-messaging/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ threadId, messageId, finalReply }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Failed to send reply (${res.status})`);
    }
  },

  addTemplate: async (template) => {
    const res = await fetch('/api/ai-messaging/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to add template');
  },

  updateTemplate: async (id, template) => {
    const res = await fetch(`/api/ai-messaging/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to update template');
  },

  deleteTemplate: async (id) => {
    const res = await fetch(`/api/ai-messaging/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  saveMetaCredentials: async (creds) => {
    const merged = { ...get().metaCredentials, ...creds } as MetaCredentials;
    const res = await fetch('/api/db/site/meta_credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(merged),
    });
    if (!res.ok) throw new Error('Failed to save Meta credentials');
    set({ metaCredentials: merged });
  },

  subscribeAIData: () => {
    const channels: RealtimeChannel[] = [];
    let threadsChannel: RealtimeChannel | null = null;

    // 1. Initial load — settings + knowledge + threads (with messages) + templates + meta creds.
    (async () => {
      // Settings
      const storedSettings = await fetchSiteRow<Partial<AIAssistantSettings>>('ai_settings');
      if (storedSettings) {
        set({ settings: { ...defaultSettings, ...storedSettings } });
      }

      // Knowledge
      const { data: kbData } = await supabase
        .from('ai_knowledge')
        .select('*')
        .order('created_at', { ascending: false });
      if (kbData) {
        set({ knowledgeBase: kbData as AIKnowledgeItem[] });
      }

      // Threads
      const { data: threadsData } = await supabase
        .from('ai_threads')
        .select('*')
        .order('updated_at', { ascending: false });
      if (threadsData) {
        const threads = threadsData as AIThread[];
        // Fetch messages per thread in parallel
        const threadsWithMessages = await Promise.all(
          threads.map(async (t) => {
            const { data: msgs } = await supabase
              .from('ai_messages')
              .select('*')
              .eq('thread_id', t.id)
              .order('created_at', { ascending: true });
            return { ...t, messages: (msgs as AIMessage[]) || [] };
          })
        );
        set({ threads: threadsWithMessages });
      }

      // Templates (load from DB; if table doesn't exist yet, fall back to defaults)
      try {
        const { data: tplData, error: tplErr } = await supabase
          .from('ai_templates')
          .select('*')
          .order('created_at', { ascending: true });
        if (!tplErr && tplData && tplData.length > 0) {
          set({ templates: tplData as AIReplyTemplate[] });
        }
      } catch (e) {
        // Table might not exist yet (migration not run). Keep defaults.
        console.warn('[aiAssistantStore] templates table not available, using defaults');
      }

      // Meta credentials (WhatsApp + Instagram tokens)
      const storedMetaCreds = await fetchSiteRow<MetaCredentials>('meta_credentials');
      if (storedMetaCreds) {
        set({ metaCredentials: storedMetaCreds });
      }
    })().catch((e) => console.error('[aiAssistantStore] Initial load error:', e));

    // 2. Realtime: settings (via site row updates)
    const settingsChannel = supabase
      .channel('site:ai_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site', filter: 'key=eq.ai_settings' },
        async (payload) => {
          const newRow = payload.new as { key: string; data: Partial<AIAssistantSettings> } | null;
          if (newRow?.data) {
            set({ settings: { ...defaultSettings, ...newRow.data } });
          }
        }
      )
      .subscribe();
    channels.push(settingsChannel);

    // 3. Realtime: knowledge base
    const knowledgeChannel = supabase
      .channel('ai_knowledge:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_knowledge' },
        async () => {
          // Refetch full collection (simplest correct approach for CRUD).
          const { data } = await supabase
            .from('ai_knowledge')
            .select('*')
            .order('created_at', { ascending: false });
          if (data) set({ knowledgeBase: data as AIKnowledgeItem[] });
        }
      )
      .subscribe();
    channels.push(knowledgeChannel);

    // 4. Realtime: threads list
    threadsChannel = supabase
      .channel('ai_threads:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_threads' },
        async () => {
          const { data } = await supabase
            .from('ai_threads')
            .select('*')
            .order('updated_at', { ascending: false });
          if (!data) return;
          const freshThreads = data as AIThread[];
          // Preserve already-loaded messages for threads that still exist.
          const prevById = new Map(get().threads.map((t) => [t.id, t]));
          set({
            threads: freshThreads.map((t) => ({
              ...t,
              messages: prevById.get(t.id)?.messages || [],
            })),
          });
        }
      )
      .subscribe();
    channels.push(threadsChannel);

    // 5. Realtime: messages (one channel for all messages; we route by thread_id)
    const messagesChannel = supabase
      .channel('ai_messages:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_messages' },
        async (payload) => {
          const row = payload.new as AIMessage | null;
          // On INSERT/UPDATE: refetch the affected thread's messages
          if (row?.thread_id) {
            const { data: msgs } = await supabase
              .from('ai_messages')
              .select('*')
              .eq('thread_id', row.thread_id)
              .order('created_at', { ascending: true });
            set((state) => ({
              threads: state.threads.map((t) =>
                t.id === row.thread_id
                  ? { ...t, messages: (msgs as AIMessage[]) || [] }
                  : t
              ),
            }));
          }
        }
      )
      .subscribe();
    channels.push(messagesChannel);

    // 6. Realtime: templates (refetch on any change)
    const templatesChannel = supabase
      .channel('ai_templates:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_templates' },
        async () => {
          try {
            const { data } = await supabase
              .from('ai_templates')
              .select('*')
              .order('created_at', { ascending: true });
            if (data && data.length > 0) set({ templates: data as AIReplyTemplate[] });
          } catch (e) {
            // ignore — table may not exist
          }
        }
      )
      .subscribe();
    channels.push(templatesChannel);

    return () => {
      for (const ch of channels) {
        supabase.removeChannel(ch);
      }
    };
  },
}));
