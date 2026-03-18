import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Sun, Moon, ArrowDown } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import TypingIndicator from './components/TypingIndicator';
import { useTheme } from './hooks/useTheme';
import {
  Message,
  Conversation,
  Model,
  AVAILABLE_MODELS,
  listConversations,
  getConversation,
  streamChat,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load models and conversations on mount
  useEffect(() => {
    setModels(AVAILABLE_MODELS);
    refreshConversations();
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

  const handleSend = (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(false);

    let streamingContent = '';
    let currentConvId = activeConversationId;

    const controller = streamChat(
      message,
      activeConversationId,
      selectedModel,
      (chunk: string, convId: string) => {
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
      (_convId: string) => {
        setIsLoading(false);
        setIsStreaming(false);
        refreshConversations();
      },
      (_error: string) => {
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
    );

    abortControllerRef.current = controller;
  };

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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

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
        />
      </main>
    </div>
  );
}

export default App;
