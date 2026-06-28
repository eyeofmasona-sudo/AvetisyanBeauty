import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings2, BookOpen, MessageSquare,
  Inbox as InboxIcon, UserCheck, BarChart3, Save,
  CheckCircle, XCircle, Bot
} from 'lucide-react';
import { useAIAssistantStore } from '../store/aiAssistantStore';
import { Settings } from '../pages/admin/ai-assistant/Settings';
import { Knowledge } from '../pages/admin/ai-assistant/Knowledge';
import { Inbox } from '../pages/admin/ai-assistant/Inbox';
import { Templates } from '../pages/admin/ai-assistant/Templates';
import { Analytics } from '../pages/admin/ai-assistant/Analytics';

export function AIAssistantModule() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('settings');

  const { settings, subscribeAIData } = useAIAssistantStore();

  useEffect(() => {
    const unsubscribe = subscribeAIData();
    return unsubscribe;
  }, [subscribeAIData]);

  const subTabs = [
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'templates', label: 'Templates', icon: MessageSquare },
    { id: 'inbox', label: 'Inbox', icon: InboxIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-graphite flex items-center gap-3">
          <Bot className="text-gold" size={32} />
          AI Messaging Assistant
        </h1>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-graphite/5">
          <div className={`w-2 h-2 rounded-full ${settings.is_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-graphite">
            {settings.is_enabled ? 'Active' : 'Disabled'} ({settings.mode.replace('_', ' ')})
          </span>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'bg-graphite text-gold shadow-md' 
                : 'bg-white border border-graphite/10 text-graphite hover:border-gold/30'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-graphite/5">
        {activeSubTab === 'settings' && <Settings />}
        {activeSubTab === 'knowledge' && <Knowledge />}
        {activeSubTab === 'inbox' && <Inbox />}
        {activeSubTab === 'templates' && <Templates />}
        {activeSubTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}
