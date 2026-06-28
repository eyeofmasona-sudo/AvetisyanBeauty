import { create } from 'zustand';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';

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

  addTemplate: (template: Omit<AIReplyTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<AIReplyTemplate>) => void;

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

// Per-thread message subcollection listeners, keyed by thread id, so we can
// tear them down when the thread list changes or the module unmounts.
let messageUnsubscribers: Record<string, Unsubscribe> = {};

export const useAIAssistantStore = create<AIAssistantState>()((set, get) => ({
  settings: defaultSettings,
  knowledgeBase: [],
  threads: [],
  templates: defaultTemplates,

  updateSettings: async (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    await setDoc(doc(db, 'site', 'ai_settings'), settings, { merge: true });
  },

  addKnowledgeItem: async (item) => {
    const now = Date.now();
    await addDoc(collection(db, 'ai_knowledge'), { ...item, created_at: now, updated_at: now });
  },

  updateKnowledgeItem: async (id, item) => {
    await updateDoc(doc(db, 'ai_knowledge', id), { ...item, updated_at: Date.now() });
  },

  deleteKnowledgeItem: async (id) => {
    await deleteDoc(doc(db, 'ai_knowledge', id));
  },

  updateMessageStatus: async (threadId, messageId, status, requires_human) => {
    await updateDoc(doc(db, 'ai_threads', threadId, 'messages', messageId), {
      status,
      ...(requires_human !== undefined ? { requires_human } : {}),
    });
    await updateDoc(doc(db, 'ai_threads', threadId), { status });
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

  addTemplate: (template) => set((state) => ({
    templates: [
      ...state.templates,
      {
        ...template,
        id: Math.random().toString(36).substring(2, 9)
      }
    ]
  })),

  updateTemplate: (id, template) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, ...template } : t
    )
  })),

  subscribeAIData: () => {
    const unsubSettings = onSnapshot(doc(db, 'site', 'ai_settings'), (snap) => {
      if (snap.exists()) {
        set({ settings: { ...defaultSettings, ...(snap.data() as Partial<AIAssistantSettings>) } });
      }
    });

    const unsubKnowledge = onSnapshot(collection(db, 'ai_knowledge'), (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AIKnowledgeItem));
      set({ knowledgeBase: items });
    });

    const unsubThreads = onSnapshot(
      query(collection(db, 'ai_threads'), orderBy('updated_at', 'desc')),
      (snap) => {
        const existingThreads = get().threads;
        const threadsById = new Map(existingThreads.map((t) => [t.id, t]));

        const seenIds = new Set<string>();
        const nextThreads: AIThread[] = snap.docs.map((d) => {
          seenIds.add(d.id);
          const data = d.data() as Omit<AIThread, 'id' | 'messages'>;
          const previous = threadsById.get(d.id);
          return { id: d.id, ...data, messages: previous?.messages || [] };
        });
        set({ threads: nextThreads });

        // Drop listeners for threads that no longer exist.
        for (const id of Object.keys(messageUnsubscribers)) {
          if (!seenIds.has(id)) {
            messageUnsubscribers[id]();
            delete messageUnsubscribers[id];
          }
        }

        // Add listeners for newly-seen threads.
        for (const threadId of seenIds) {
          if (messageUnsubscribers[threadId]) continue;
          messageUnsubscribers[threadId] = onSnapshot(
            query(collection(db, 'ai_threads', threadId, 'messages'), orderBy('created_at', 'asc')),
            (msgSnap) => {
              const messages = msgSnap.docs.map((m) => ({ id: m.id, ...m.data() } as AIMessage));
              set((state) => ({
                threads: state.threads.map((t) => (t.id === threadId ? { ...t, messages } : t)),
              }));
            }
          );
        }
      }
    );

    return () => {
      unsubSettings();
      unsubKnowledge();
      unsubThreads();
      for (const id of Object.keys(messageUnsubscribers)) {
        messageUnsubscribers[id]();
      }
      messageUnsubscribers = {};
    };
  },
}));
