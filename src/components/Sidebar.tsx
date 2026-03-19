import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Conversation, deleteConversation, renameConversation } from '../lib/api';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRefresh,
  isOpen,
  onClose,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
      onRefresh();
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    onRefresh();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col glass-sidebar text-white w-72 transition-transform duration-300 ease-out border-r border-white/5 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">NexusAI</span>
              <div className="text-[10px] text-gray-500 font-medium -mt-0.5">Unlimited AI Chat</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-violet-500/30 hover:bg-white/5 transition-all duration-300 text-sm font-medium group"
          >
            <div className="p-1 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-colors">
              <Plus size={16} className="text-violet-400" />
            </div>
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-gray-600" />
              </div>
              No conversations yet.
              <br />
              <span className="text-gray-600">Start a new chat!</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeId === conv.id
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <MessageSquare size={15} className="flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="bg-white/10 text-white text-sm px-2 py-0.5 rounded-lg w-full outline-none border border-white/10 focus:border-violet-500/50"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id);
                          }}
                          className="p-0.5 hover:text-emerald-400 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-0.5 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm truncate font-medium">{conv.title}</div>
                        <div className="text-[11px] text-gray-500">{formatDate(conv.updated_at)}</div>
                      </>
                    )}
                  </div>
                  {editingId !== conv.id && (
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <Sparkles size={12} className="text-violet-400/60" />
            Free & Unlimited AI
          </div>
        </div>
      </aside>
    </>
  );
}
