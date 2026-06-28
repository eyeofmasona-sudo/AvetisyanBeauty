import React, { useState } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Check, Link as LinkIcon } from 'lucide-react';
import { useAIAssistantStore, AIKnowledgeItem } from '../../../store/aiAssistantStore';
import { useContentStore } from '../../../store/contentStore';

export function Knowledge() {
  const { knowledgeBase, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem } = useAIAssistantStore();
  const { content } = useContentStore();
  
  // Try to get services from 'en' content, fallback to others if needed
  const services = content['en']?.services?.items || [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const categories = ['Procedure', 'Pricing', 'Preparation', 'Aftercare', 'General'];
  
  const initialFormState = {
    category: 'General',
    question: '',
    answer_hy: '',
    answer_ru: '',
    answer_en: '',
    service_slug: '',
    is_active: true,
    requires_human_review: false
  };
  
  const [formData, setFormData] = useState<Partial<AIKnowledgeItem>>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenModal = (item?: AIKnowledgeItem) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
    }
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.question || !formData.answer_en || !formData.answer_ru || !formData.answer_hy) {
      alert('Please fill out all required fields');
      return;
    }

    if (editingId) {
      updateKnowledgeItem(editingId, formData);
    } else {
      addKnowledgeItem(formData as Omit<AIKnowledgeItem, 'id' | 'created_at' | 'updated_at'>);
    }
    handleCloseModal();
  };

  const filteredItems = knowledgeBase.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="font-display text-xl text-graphite">Knowledge Base</h3>
          <p className="text-sm text-graphite/60 mt-1">
            Train your AI Assistant by providing facts and standard answers.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-gold text-white px-4 py-2 rounded-xl text-sm hover:bg-gold/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite/40" />
          <input 
            type="text" 
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-pearl border-none text-sm focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-pearl border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-pearl p-8 rounded-2xl border border-graphite/10 text-center text-graphite/60">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50 text-gold" />
          <p>No knowledge base items found.</p>
          {searchQuery || categoryFilter !== 'all' ? (
            <button 
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="mt-4 text-gold hover:underline text-sm"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const linkedService = services.find(s => s.id === item.service_slug);
            return (
              <div key={item.id} className="bg-white border border-graphite/10 rounded-2xl p-6 hover:border-gold/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-pearl text-graphite/60 rounded-full text-xs font-medium uppercase tracking-wider">
                        {item.category}
                      </span>
                      {linkedService && (
                        <span className="flex items-center gap-1 text-gold text-xs font-medium bg-gold/10 px-3 py-1 rounded-full">
                          <LinkIcon size={12} />
                          {linkedService.title}
                        </span>
                      )}
                      {!item.is_active && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                      {item.requires_human_review && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                          Requires Human
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-lg text-graphite mb-2">{item.question}</h4>
                    <div className="text-sm text-graphite/70 line-clamp-2">
                      <span className="font-medium mr-2">EN:</span>{item.answer_en}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-2 bg-pearl rounded-xl text-graphite/60 hover:text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this item?')) {
                          deleteKnowledgeItem(item.id);
                        }
                      }}
                      className="p-2 bg-pearl rounded-xl text-graphite/60 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-graphite/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-graphite/10 flex justify-between items-center bg-pearl sticky top-0 z-10">
              <h3 className="font-display text-xl text-graphite">
                {editingId ? 'Edit Knowledge Item' : 'New Knowledge Item'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-graphite/40 hover:text-graphite transition-colors p-2 bg-white rounded-full hover:bg-graphite/5"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Question */}
              <div>
                <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
                  Question / Trigger
                </label>
                <input 
                  type="text"
                  value={formData.question || ''}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none"
                  placeholder="e.g. How much does Ultraformer cost?"
                />
              </div>

              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || 'General'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
                    Link to Service
                  </label>
                  <select
                    value={formData.service_slug || ''}
                    onChange={(e) => setFormData({...formData, service_slug: e.target.value})}
                    className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none"
                  >
                    <option value="">None (General)</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <label className="block text-xs font-medium text-graphite/60 uppercase tracking-widest mb-2">
                  Standard Answers (Multi-language)
                </label>
                
                <div>
                  <span className="text-xs font-medium text-graphite/60 mb-1 block">English</span>
                  <textarea 
                    value={formData.answer_en || ''}
                    onChange={(e) => setFormData({...formData, answer_en: e.target.value})}
                    className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none min-h-[80px]"
                    placeholder="Provide the English answer..."
                  />
                </div>
                
                <div>
                  <span className="text-xs font-medium text-graphite/60 mb-1 block">Russian (Русский)</span>
                  <textarea 
                    value={formData.answer_ru || ''}
                    onChange={(e) => setFormData({...formData, answer_ru: e.target.value})}
                    className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none min-h-[80px]"
                    placeholder="Provide the Russian answer..."
                  />
                </div>
                
                <div>
                  <span className="text-xs font-medium text-graphite/60 mb-1 block">Armenian (Հայերեն)</span>
                  <textarea 
                    value={formData.answer_hy || ''}
                    onChange={(e) => setFormData({...formData, answer_hy: e.target.value})}
                    className="w-full bg-pearl border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/30 outline-none min-h-[80px]"
                    placeholder="Provide the Armenian answer..."
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="flex flex-col gap-4 pt-4 border-t border-graphite/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-gold' : 'bg-graphite/20'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-graphite group-hover:text-gold transition-colors">Active Status</span>
                    <span className="block text-xs text-graphite/50">Allow AI to use this knowledge in replies</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.requires_human_review ? 'bg-orange-500' : 'bg-graphite/20'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.requires_human_review ? 'translate-x-6' : ''}`} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-graphite group-hover:text-orange-500 transition-colors">Flag for Human Review</span>
                    <span className="block text-xs text-graphite/50">Always require staff approval before sending</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.requires_human_review || false}
                    onChange={(e) => setFormData({...formData, requires_human_review: e.target.checked})}
                  />
                </label>
              </div>

            </div>
            <div className="p-6 border-t border-graphite/10 flex justify-end gap-3 bg-pearl rounded-b-[2rem]">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-3 rounded-xl text-sm font-medium text-graphite hover:bg-white hover:shadow-sm transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-gold text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gold/90 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Check size={18} />
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
