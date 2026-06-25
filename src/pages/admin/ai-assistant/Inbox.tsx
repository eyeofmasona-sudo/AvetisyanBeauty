import React, { useState } from 'react';
import { Bot, CheckCircle, MessageSquare, AlertCircle, Clock, User, Send, Edit2, CornerDownRight } from 'lucide-react';
import { useAIAssistantStore, AIThread, AIMessage } from '../../../store/aiAssistantStore';

export function Inbox() {
  const { threads, approveMessage, updateMessageStatus } = useAIAssistantStore();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threads.length > 0 ? threads[0].id : null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'needs_human' | 'answered'>('all');

  const filteredThreads = threads.filter(t => statusFilter === 'all' || t.status === statusFilter);
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const stats = {
    total: threads.length,
    new: threads.filter(t => t.status === 'new').length,
    needs_human: threads.filter(t => t.status === 'needs_human').length,
    answered: threads.filter(t => t.status === 'answered').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'needs_human': return 'bg-orange-100 text-orange-700';
      case 'answered': return 'bg-green-100 text-green-700';
      default: return 'bg-graphite/10 text-graphite';
    }
  };

  const [editStates, setEditStates] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h3 className="font-display text-2xl text-graphite mb-1">AI Inbox & Approvals</h3>
          <p className="text-sm text-graphite/60">Review, edit, and approve AI-generated responses.</p>
        </div>
      </div>
      
      {/* Status Board */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        <button 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'all' ? 'border-gold bg-gold/5' : 'border-graphite/10 bg-white hover:border-gold/30'}`}
        >
          <div className="text-sm text-graphite/60 mb-1">All Messages</div>
          <div className="text-2xl font-display text-graphite">{stats.total}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('new')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'new' ? 'border-blue-500 bg-blue-50' : 'border-graphite/10 bg-white hover:border-blue-500/30'}`}
        >
          <div className="flex items-center gap-2 text-sm text-graphite/60 mb-1">
            <Clock size={16} className="text-blue-500" />
            Pending Approval
          </div>
          <div className="text-2xl font-display text-graphite">{stats.new}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('needs_human')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'needs_human' ? 'border-orange-500 bg-orange-50' : 'border-graphite/10 bg-white hover:border-orange-500/30'}`}
        >
          <div className="flex items-center gap-2 text-sm text-graphite/60 mb-1">
            <AlertCircle size={16} className="text-orange-500" />
            Human Review
          </div>
          <div className="text-2xl font-display text-graphite">{stats.needs_human}</div>
        </button>
        <button 
          onClick={() => setStatusFilter('answered')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'answered' ? 'border-green-500 bg-green-50' : 'border-graphite/10 bg-white hover:border-green-500/30'}`}
        >
          <div className="flex items-center gap-2 text-sm text-graphite/60 mb-1">
            <CheckCircle size={16} className="text-green-500" />
            Answered
          </div>
          <div className="text-2xl font-display text-graphite">{stats.answered}</div>
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Thread List Sidebar */}
        <div className="w-1/3 bg-white rounded-[2rem] border border-graphite/10 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-graphite/10 bg-pearl/50">
            <h4 className="font-medium text-graphite">Conversations</h4>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-graphite/40">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                <p>No conversations found.</p>
              </div>
            ) : (
              filteredThreads.map(thread => (
                <button 
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${selectedThreadId === thread.id ? 'bg-pearl border-gold/30 border shadow-sm' : 'hover:bg-graphite/5 border border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-graphite truncate pr-2">{thread.customer_name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${getStatusColor(thread.status)}`}>
                      {thread.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-graphite/50 truncate mb-2">
                    @{thread.customer_handle} • {thread.channel}
                  </div>
                  <div className="text-sm text-graphite/70 line-clamp-2">
                    {thread.messages[thread.messages.length - 1]?.original_text}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread Detail View */}
        <div className="flex-1 bg-white rounded-[2rem] border border-graphite/10 flex flex-col overflow-hidden shadow-sm">
          {selectedThread ? (
            <>
              <div className="p-6 border-b border-graphite/10 bg-pearl/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-graphite/5 rounded-full flex items-center justify-center text-graphite/40">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-graphite">{selectedThread.customer_name}</h3>
                    <div className="text-sm text-graphite/50 flex items-center gap-2">
                      <span>@{selectedThread.customer_handle}</span>
                      <span>•</span>
                      <span className="uppercase">{selectedThread.channel}</span>
                      <span>•</span>
                      <span className="uppercase">{selectedThread.language}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-pearl/10">
                {selectedThread.messages.map(msg => (
                  <div key={msg.id} className="space-y-4">
                    {/* Customer Message */}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-graphite/10 flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-graphite/60" />
                      </div>
                      <div className="bg-pearl p-4 rounded-2xl rounded-tl-sm border border-graphite/5 text-graphite max-w-[80%] shadow-sm">
                        <p className="text-sm">{msg.original_text}</p>
                        <div className="text-[10px] text-graphite/40 mt-2">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Suggestion / Approval Controls */}
                    {msg.status === 'new' && msg.ai_suggested_reply && (
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-1">
                          <Bot size={14} className="text-gold" />
                        </div>
                        <div className="bg-white border-2 border-gold/30 p-5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md w-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/40 to-gold"></div>
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-medium text-gold uppercase tracking-wider flex items-center gap-1">
                              <Bot size={12} /> AI Draft
                            </span>
                            <span className="text-xs text-graphite/40 bg-graphite/5 px-2 py-0.5 rounded-md">
                              Confidence: {msg.confidence}%
                            </span>
                          </div>
                          
                          <textarea 
                            className="w-full bg-pearl/30 border border-graphite/10 rounded-xl p-3 text-sm text-graphite focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 min-h-[100px] resize-y mb-4"
                            value={editStates[msg.id] ?? msg.ai_suggested_reply}
                            onChange={(e) => setEditStates({ ...editStates, [msg.id]: e.target.value })}
                            placeholder="Edit the AI's suggested reply..."
                          />
                          
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => updateMessageStatus(selectedThread.id, msg.id, 'needs_human', true)}
                              className="px-4 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-orange-200 flex items-center gap-2"
                            >
                              <AlertCircle size={14} /> Request Human Review
                            </button>
                            <button 
                              onClick={() => {
                                const finalReply = editStates[msg.id] ?? msg.ai_suggested_reply;
                                approveMessage(selectedThread.id, msg.id, finalReply);
                                setEditStates({ ...editStates, [msg.id]: '' });
                              }}
                              className="px-6 py-2 text-sm font-medium bg-gold text-white hover:bg-gold/90 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                              <Send size={14} /> Approve & Send
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Final Approved Reply */}
                    {msg.final_reply && (
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-graphite flex items-center justify-center shrink-0 mt-1">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="bg-graphite text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm relative">
                           <div className="absolute -left-3 top-4 text-green-500">
                             <CheckCircle size={16} className="bg-white rounded-full" />
                           </div>
                           <p className="text-sm">{msg.final_reply}</p>
                           <div className="text-[10px] text-white/50 mt-2 flex items-center justify-end gap-1">
                             <CheckCircle size={10} /> Sent
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Needs Human Review state */}
                    {msg.status === 'needs_human' && !msg.final_reply && (
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                          <User size={14} className="text-orange-600" />
                        </div>
                        <div className="bg-white border-2 border-orange-200 p-5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm w-full">
                           <div className="flex items-center gap-2 mb-3 text-orange-600">
                             <AlertCircle size={16} />
                             <span className="text-sm font-medium">Awaiting Human Response</span>
                           </div>
                           <textarea 
                              className="w-full bg-pearl border border-graphite/10 rounded-xl p-3 text-sm text-graphite focus:outline-none focus:border-orange-300 min-h-[100px] resize-y mb-4"
                              placeholder="Type your manual reply here..."
                              value={editStates[msg.id] || ''}
                              onChange={(e) => setEditStates({ ...editStates, [msg.id]: e.target.value })}
                            />
                            <div className="flex justify-end">
                              <button 
                                onClick={() => {
                                  const finalReply = editStates[msg.id];
                                  if (!finalReply) return;
                                  approveMessage(selectedThread.id, msg.id, finalReply);
                                  setEditStates({ ...editStates, [msg.id]: '' });
                                }}
                                disabled={!editStates[msg.id]}
                                className="px-6 py-2 text-sm font-medium bg-graphite text-white hover:bg-graphite/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center gap-2"
                              >
                                <Send size={14} /> Send Manual Reply
                              </button>
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-graphite/40">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Select a conversation to review AI responses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
