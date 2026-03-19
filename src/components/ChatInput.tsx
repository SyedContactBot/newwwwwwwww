import { useState, useRef, useEffect } from 'react';
import { Send, Square, ChevronDown, Sparkles } from 'lucide-react';
import { Model, MODEL_CATEGORIES } from '../lib/api';

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
    <div className="px-4 py-4 glass border-t border-gray-200/50 dark:border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-white/80 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-200/80 dark:border-white/10 focus-within:border-violet-400/50 dark:focus-within:border-violet-500/30 transition-all duration-300 shadow-sm focus-within:shadow-md focus-within:shadow-violet-500/5 hover-glow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NexusAI anything..."
            className="flex-1 bg-transparent outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm leading-6 max-h-48"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Model Selector */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 px-2.5 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20"
              >
                <Sparkles size={11} className="text-violet-400" />
                {currentModel?.name || 'Select Model'}
                <ChevronDown size={11} className={`transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`} />
              </button>
              {showModels && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-[#141420] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 py-2 min-w-64 z-50 max-h-80 overflow-y-auto animate-scale-fade-in">
                  {MODEL_CATEGORIES.map((category) => {
                    const categoryModels = models.filter((m) => m.category === category.id);
                    if (categoryModels.length === 0) return null;
                    return (
                      <div key={category.id}>
                        <div className="px-3 pt-2 pb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                            {category.label}
                          </span>
                        </div>
                        {categoryModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              onModelChange(model.id);
                              setShowModels(false);
                            }}
                            className={`w-full text-left px-3 py-2 transition-all duration-150 group ${
                              selectedModel === model.id
                                ? 'bg-violet-50 dark:bg-violet-500/10'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.color} ${selectedModel === model.id ? 'scale-125' : 'scale-75 opacity-50 group-hover:scale-100 group-hover:opacity-100'} transition-all`} />
                              <div>
                                <div className={`text-sm font-medium ${
                                  selectedModel === model.id
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {model.name}
                                  <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 ml-1.5">{model.provider}</span>
                                </div>
                                <div className="text-[11px] text-gray-400 dark:text-gray-500">{model.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Send / Stop Button */}
            {isLoading ? (
              <button
                onClick={onStop}
                className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                title="Stop generating"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  input.trim()
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30'
                    : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
        <div className="text-center mt-2.5 text-[11px] text-gray-400 dark:text-gray-600">
          Free & unlimited across 12+ AI models. Enter to send, Shift+Enter for new line.
        </div>
      </div>
    </div>
  );
}
