import React from 'react';
import { useAIAssistantStore } from '../../../store/aiAssistantStore';

export function Settings() {
  const { settings, updateSettings } = useAIAssistantStore();

  return (
    <div className="space-y-8">
      <h3 className="font-display text-xl text-graphite border-b border-graphite/10 pb-4">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-graphite">Enable AI Assistant</span>
              <input 
                type="checkbox" 
                checked={settings.is_enabled}
                onChange={(e) => updateSettings({ is_enabled: e.target.checked })}
                className="w-5 h-5 accent-gold"
              />
            </label>
            <p className="text-xs text-graphite/60">Turn on or off the AI auto-responses globally.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Operation Mode</label>
            <select 
              value={settings.mode}
              onChange={(e) => updateSettings({ mode: e.target.value as any })}
              className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
            >
              <option value="draft_only">Draft Only (AI suggests, human copies)</option>
              <option value="approval_required">Approval Required (Human clicks 'Send')</option>
              <option value="auto_reply">Auto Reply (AI sends automatically if confident)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Working Hours</label>
            <input 
              type="text" 
              value={settings.working_hours}
              onChange={(e) => updateSettings({ working_hours: e.target.value })}
              className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none"
              placeholder="e.g. 10:00-20:00"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (EN)</label>
            <textarea 
              value={settings.fallback_message_en}
              onChange={(e) => updateSettings({ fallback_message_en: e.target.value })}
              className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
            />
            <p className="text-xs text-graphite/60 mt-1">Used when AI cannot answer or intent is human_required.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (RU)</label>
            <textarea 
              value={settings.fallback_message_ru}
              onChange={(e) => updateSettings({ fallback_message_ru: e.target.value })}
              className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-graphite mb-2">Fallback Message (HY)</label>
            <textarea 
              value={settings.fallback_message_hy}
              onChange={(e) => updateSettings({ fallback_message_hy: e.target.value })}
              className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none resize-none h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
