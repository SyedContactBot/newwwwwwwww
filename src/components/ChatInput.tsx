import { useState, useRef, useEffect } from 'react';
import { Send, Square, ChevronDown } from 'lucide-react';
import { Model } from '../lib/api';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  models: Model[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  models,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showModels, setShowModels] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

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

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
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
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-48 z-50">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setShowModels(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedModel === model.id
                          ? 'text-blue-500 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {model.name}
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
                title="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
          NexusAI is free and unlimited. Press Enter to send, Shift+Enter for new line.
        </div>
      </div>
    </div>
  );
}
