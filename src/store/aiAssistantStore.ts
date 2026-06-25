import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  updateSettings: (settings: Partial<AIAssistantSettings>) => void;
  addKnowledgeItem: (item: Omit<AIKnowledgeItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateKnowledgeItem: (id: string, item: Partial<AIKnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
  
  addThread: (thread: Omit<AIThread, 'id' | 'created_at' | 'updated_at' | 'messages'>) => void;
  addMessage: (threadId: string, message: Omit<AIMessage, 'id' | 'created_at'>) => void;
  updateMessageStatus: (threadId: string, messageId: string, status: AIStatus, requires_human?: boolean) => void;
  approveMessage: (threadId: string, messageId: string, finalReply: string) => void;
  
  addTemplate: (template: Omit<AIReplyTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<AIReplyTemplate>) => void;
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

export const useAIAssistantStore = create<AIAssistantState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      knowledgeBase: [],
      threads: [
        {
          id: 'mock-thread-1',
          channel: 'instagram',
          external_thread_id: 'ig-123',
          customer_name: 'Anna K.',
          customer_handle: 'anna_k_beauty',
          language: 'ru',
          status: 'new',
          created_at: Date.now(),
          updated_at: Date.now(),
          messages: [
            {
              id: 'mock-msg-1',
              thread_id: 'mock-thread-1',
              direction: 'inbound',
              channel: 'instagram',
              original_text: 'Здравствуйте! Подскажите, сколько стоит Ultraformer III для лица?',
              detected_language: 'ru',
              ai_suggested_reply: 'Здравствуйте! Стоимость процедуры Ultraformer III для лица начинается от 150 000 драм, в зависимости от количества линий. Желаете записаться на консультацию?',
              status: 'new',
              requires_human: false,
              created_at: Date.now()
            }
          ]
        }
      ],
      templates: defaultTemplates,

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      addKnowledgeItem: (item) => set((state) => ({
        knowledgeBase: [
          ...state.knowledgeBase,
          {
            ...item,
            id: Math.random().toString(36).substring(2, 9),
            created_at: Date.now(),
            updated_at: Date.now(),
          }
        ]
      })),

      updateKnowledgeItem: (id, item) => set((state) => ({
        knowledgeBase: state.knowledgeBase.map((k) =>
          k.id === id ? { ...k, ...item, updated_at: Date.now() } : k
        )
      })),

      deleteKnowledgeItem: (id) => set((state) => ({
        knowledgeBase: state.knowledgeBase.filter((k) => k.id !== id)
      })),

      addThread: (thread) => set((state) => ({
        threads: [
          {
            ...thread,
            id: Math.random().toString(36).substring(2, 9),
            messages: [],
            created_at: Date.now(),
            updated_at: Date.now(),
          },
          ...state.threads
        ]
      })),

      addMessage: (threadId, message) => set((state) => ({
        threads: state.threads.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              updated_at: Date.now(),
              messages: [
                ...t.messages,
                {
                  ...message,
                  id: Math.random().toString(36).substring(2, 9),
                  created_at: Date.now()
                }
              ]
            };
          }
          return t;
        })
      })),

      updateMessageStatus: (threadId, messageId, status, requires_human) => set((state) => ({
        threads: state.threads.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              status: status, // update thread status as well
              messages: t.messages.map((m) =>
                m.id === messageId
                  ? { ...m, status, requires_human: requires_human ?? m.requires_human }
                  : m
              )
            };
          }
          return t;
        })
      })),

      approveMessage: (threadId, messageId, finalReply) => set((state) => ({
        threads: state.threads.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              status: 'answered',
              messages: t.messages.map((m) =>
                m.id === messageId
                  ? { ...m, status: 'answered', final_reply: finalReply }
                  : m
              )
            };
          }
          return t;
        })
      })),

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

    }),
    {
      name: 'ai-assistant-storage',
    }
  )
);
