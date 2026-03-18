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
  Search,
  Pin,
  Download,
  Settings,
  Trash,
} from 'lucide-react';
import {
  Conversation,
  deleteConversation,
  renameConversation,
  togglePinConversation,
  clearAllConversations,
  exportConversation,
  searchConversations,
} from '../lib/api';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRefresh,
  isOpen,
  onClose,
  onOpenSettings,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const handlePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    togglePinConversation(id);
    onRefresh();
  };

  const handleExport = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    const md = exportConversation(conv, 'markdown');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
      clearAllConversations();
      onRefresh();
    }
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

  const filteredConversations = searchQuery.trim()
    ? searchConversations(searchQuery)
    : conversations;

  // Sort: pinned first, then by updated_at
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col bg-gray-950 text-white w-72 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg">NexusAI</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 rounded hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              title="Search conversations"
            >
              <Search size={16} />
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-gray-800 text-white text-sm pl-9 pr-8 py-2 rounded-lg outline-none border border-gray-700 focus:border-gray-600 placeholder-gray-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {sortedConversations.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8 px-4">
              {searchQuery ? 'No matching conversations' : 'No conversations yet. Start a new chat!'}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    activeId === conv.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="flex-shrink-0 relative">
                    <MessageSquare size={16} />
                    {conv.pinned && (
                      <Pin size={8} className="absolute -top-1 -right-1 text-blue-400" />
                    )}
                  </div>
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
                          className="bg-gray-700 text-white text-sm px-2 py-0.5 rounded w-full outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id);
                          }}
                          className="p-0.5 hover:text-green-400"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-0.5 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm truncate">{conv.title}</div>
                        <div className="text-xs text-gray-500">{formatDate(conv.updated_at)}</div>
                      </>
                    )}
                  </div>
                  {editingId !== conv.id && (
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => handlePin(e, conv.id)}
                        className={`p-1 rounded hover:bg-gray-700 transition-colors ${conv.pinned ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                        title={conv.pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        onClick={(e) => handleExport(e, conv)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Export as Markdown"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Rename"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Settings size={14} />
              Settings
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              title="Clear all conversations"
            >
              <Trash size={14} />
              Clear All
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Free & Unlimited AI Assistant
          </div>
        </div>
      </aside>
    </>
  );
}
