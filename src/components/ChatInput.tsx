import { useState, useRef, useEffect } from 'react';
import { Send, Square, ChevronDown, Paperclip, Keyboard } from 'lucide-react';
import { Model, getWordCount } from '../lib/api';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  models: Model[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  models,
  selectedModel,
  onModelChange,
  onOpenShortcuts,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showModels, setShowModels] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModels(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onOpenShortcuts?.();
      }
      // Ctrl/Cmd + L to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onOpenShortcuts]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setInput((prev) => prev + (prev ? '\n\n' : '') + `[File: ${file.name}]\n${text}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentModel = models.find((m) => m.id === selectedModel);
  const wordCount = getWordCount(input);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
          {/* File upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.log"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NexusAI..."
            className="flex-1 bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-6 max-h-48"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Word count */}
            {input.trim() && (
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                {wordCount}w
              </span>
            )}

            {/* Keyboard shortcuts */}
            <button
              onClick={onOpenShortcuts}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard size={16} />
            </button>

            {/* Model Selector */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {currentModel?.name || 'Select Model'}
                <ChevronDown size={12} />
              </button>
              {showModels && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-56 z-50">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setShowModels(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedModel === model.id
                          ? 'text-blue-500 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-sm">{model.name}</div>
                      {model.description && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{model.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send / Stop Button */}
            {isLoading ? (
              <button
                onClick={onStop}
                className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Stop generating"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`p-2 rounded-xl transition-colors ${
                  input.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500 px-1">
          <span>NexusAI is free and unlimited</span>
          <span>Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
