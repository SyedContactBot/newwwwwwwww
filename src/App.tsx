import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Sun, Moon, ArrowDown, BarChart3 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import TypingIndicator from './components/TypingIndicator';
import SettingsModal from './components/SettingsModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useTheme } from './hooks/useTheme';
import {
  Message,
  Conversation,
  Model,
  AVAILABLE_MODELS,
  listConversations,
  getConversation,
  streamChat,
  regenerateLastResponse,
  editMessageAndRegenerate,
  getConversationStats,
  loadSettings,
} from './lib/api';
import 'highlight.js/styles/github-dark.css';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load models, conversations, and settings on mount
  useEffect(() => {
    setModels(AVAILABLE_MODELS);
    refreshConversations();
    const settings = loadSettings();
    setSelectedModel(settings.defaultModel);
    setSystemPrompt(settings.defaultSystemPrompt);
  }, []);

  const refreshConversations = () => {
    const convs = listConversations();
    setConversations(convs);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [messages, isStreaming, scrollToBottom]);

  // Handle scroll visibility
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectConversation = (id: string) => {
    const conv = getConversation(id);
    if (conv) {
      setActiveConversationId(id);
      setMessages(conv.messages.filter((m) => m.role !== 'system'));
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleStreamCallbacks = () => {
    let streamingContent = '';
    let currentConvId = activeConversationId;
    return {
      onChunk: (chunk: string, convId: string) => {
        if (!currentConvId) {
          currentConvId = convId;
          setActiveConversationId(convId);
        }
        streamingContent += chunk;
        setIsStreaming(true);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMsg,
              content: streamingContent,
            };
          } else {
            newMessages.push({ role: 'assistant', content: streamingContent });
          }
          return newMessages;
        });
      },
      onDone: () => {
        setIsLoading(false);
        setIsStreaming(false);
        refreshConversations();
      },
      onError: () => {
        setIsLoading(false);
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, an error occurred. Please try again.',
          },
        ]);
      },
    };
  };

  const handleSend = (message: string) => {
    const userMessage: Message = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(false);

    const { onChunk, onDone, onError } = handleStreamCallbacks();
    const controller = streamChat(
      message,
      activeConversationId,
      selectedModel,
      onChunk,
      onDone,
      onError,
      systemPrompt || undefined,
    );

    abortControllerRef.current = controller;
  };

  const handleRegenerate = () => {
    if (!activeConversationId) return;
    setIsLoading(true);
    setIsStreaming(false);
    // Remove last assistant message from UI
    setMessages((prev) => {
      const newMsgs = [...prev];
      while (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
        newMsgs.pop();
      }
      return newMsgs;
    });

    const { onChunk, onDone, onError } = handleStreamCallbacks();
    const controller = regenerateLastResponse(
      activeConversationId,
      selectedModel,
      onChunk,
      onDone,
      onError,
    );
    if (controller) {
      abortControllerRef.current = controller;
    } else {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (messageIndex: number, newContent: string) => {
    if (!activeConversationId) return;
    setIsLoading(true);
    setIsStreaming(false);
    // Truncate messages in UI to edit point
    setMessages((prev) => {
      const truncated = prev.slice(0, messageIndex);
      truncated.push({ role: 'user', content: newContent, timestamp: new Date().toISOString() });
      return truncated;
    });

    const { onChunk, onDone, onError } = handleStreamCallbacks();
    const controller = editMessageAndRegenerate(
      activeConversationId,
      messageIndex,
      newContent,
      selectedModel,
      onChunk,
      onDone,
      onError,
    );
    if (controller) {
      abortControllerRef.current = controller;
    } else {
      setIsLoading(false);
    }
  };

  // Get stats for current conversation
  const activeConv = activeConversationId ? getConversation(activeConversationId) : null;
  const stats = activeConv ? getConversationStats(activeConv) : null;

  // Find last assistant message index
  const lastAssistantIndex = messages.reduce((acc, msg, idx) => (msg.role === 'assistant' ? idx : acc), -1);

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onRefresh={refreshConversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              {activeConversationId
                ? conversations.find((c: Conversation) => c.id === activeConversationId)?.title || 'Chat'
                : 'New Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Stats toggle */}
            {stats && (
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${showStats ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
                title="Conversation stats"
              >
                <BarChart3 size={20} />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        {showStats && stats && (
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 animate-fade-in">
            <span>{stats.totalMessages} messages</span>
            <span>{stats.userMessages} from you</span>
            <span>{stats.assistantMessages} from AI</span>
            <span>{stats.totalWords} words</span>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto relative"
        >
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSend} />
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                  timestamp={msg.timestamp}
                  messageIndex={index}
                  onEdit={msg.role === 'user' && !isLoading ? handleEditMessage : undefined}
                  onRegenerate={!isLoading ? handleRegenerate : undefined}
                  isLastAssistant={index === lastAssistantIndex}
                />
              ))}
              {isLoading && !isStreaming && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-28 right-8 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg transition-all z-10"
            >
              <ArrowDown size={20} />
            </button>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onOpenSettings={() => setShowSettings(true)}
          onOpenShortcuts={() => setShowShortcuts(true)}
        />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onModelChange={setSelectedModel}
        onSystemPromptChange={setSystemPrompt}
      />
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

export default App;
