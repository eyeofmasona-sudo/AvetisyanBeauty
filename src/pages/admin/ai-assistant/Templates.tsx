import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { useAIAssistantStore, AIReplyTemplate } from '../../../store/aiAssistantStore';

export function Templates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useAIAssistantStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<AIReplyTemplate, 'id'> | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = templates.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.intent.toLowerCase().includes(search.toLowerCase())
  );

  const startAdd = () => {
    setEditingId('new');
    setEditForm({
      intent: '',
      title: '',
      template_hy: '',
      template_ru: '',
      template_en: '',
      is_active: true,
    });
  };

  const startEdit = (t: AIReplyTemplate) => {
    setEditingId(t.id);
    setEditForm({
      intent: t.intent,
      title: t.title,
      template_hy: t.template_hy,
      template_ru: t.template_ru,
      template_en: t.template_en,
      is_active: t.is_active,
    });
  };

  const handleSave = async () => {
    if (!editForm) return;
    if (!editForm.title.trim() || !editForm.intent.trim()) {
      setError('Title and Intent are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await addTemplate(editForm);
      } else if (editingId) {
        await updateTemplate(editingId, editForm);
      }
      setEditingId(null);
      setEditForm(null);
    } catch (e: any) {
      setError(e.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template? / Удалить этот шаблон?')) return;
    try {
      await deleteTemplate(id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl text-graphite">Reply Templates</h3>
          <p className="text-sm text-graphite/60 mt-1">
            Canned responses the AI matches against incoming intents. Used as a fast path when the
            knowledge base has no direct match.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 bg-graphite text-white px-5 py-2.5 rounded-full hover:bg-gold transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Template
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite/40" />
        <input
          type="text"
          placeholder="Search by title or intent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-pearl border border-graphite/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && !editingId && (
          <div className="text-center py-12 text-graphite/50">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p>No templates yet. Click "Add Template" to create one.</p>
          </div>
        )}

        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-pearl/50 border border-graphite/10 rounded-2xl p-5 hover:border-gold/30 transition-colors"
          >
            {editingId === t.id && editForm ? (
              <TemplateEditor
                form={editForm}
                onChange={setEditForm}
                onSave={handleSave}
                onCancel={() => { setEditingId(null); setEditForm(null); setError(null); }}
                saving={saving}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-graphite">{t.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded-full tracking-wider uppercase">
                      {t.intent}
                    </span>
                    {!t.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-graphite/10 text-graphite/60 rounded-full">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-graphite/60 line-clamp-2">
                    {t.template_en || t.template_ru || t.template_hy || '(empty)'}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-2 text-graphite/40 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-graphite/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Inline "new" editor */}
        {editingId === 'new' && editForm && (
          <div className="bg-pearl/50 border border-gold/30 rounded-2xl p-5">
            <TemplateEditor
              form={editForm}
              onChange={setEditForm}
              onSave={handleSave}
              onCancel={() => { setEditingId(null); setEditForm(null); setError(null); }}
              saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateEditor({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  form: Omit<AIReplyTemplate, 'id'>;
  onChange: (f: Omit<AIReplyTemplate, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            placeholder="e.g. Узнать цену"
            className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
            Intent * (machine-readable, e.g. price_question)
          </label>
          <input
            type="text"
            value={form.intent}
            onChange={(e) => onChange({ ...form, intent: e.target.value })}
            placeholder="price_question"
            className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
            🇦🇲 Armenian
          </label>
          <textarea
            value={form.template_hy}
            onChange={(e) => onChange({ ...form, template_hy: e.target.value })}
            className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none h-24"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
            🇷🇺 Russian
          </label>
          <textarea
            value={form.template_ru}
            onChange={(e) => onChange({ ...form, template_ru: e.target.value })}
            className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none h-24"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
            🇬🇧 English
          </label>
          <textarea
            value={form.template_en}
            onChange={(e) => onChange({ ...form, template_en: e.target.value })}
            className="w-full bg-pearl border border-graphite/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none h-24"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-graphite">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
          className="w-4 h-4 accent-gold"
        />
        Active (AI will use this template)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-medium text-graphite/60 hover:bg-graphite/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Check size={14} className="animate-pulse" /> : <Check size={14} />}
          Save
        </button>
      </div>
    </div>
  );
}
