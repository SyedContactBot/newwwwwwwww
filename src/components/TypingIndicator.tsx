import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-6 bg-gray-50 dark:bg-gray-800/50 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
          <Bot size={16} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 pulse-dot-1" />
        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 pulse-dot-2" />
        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 pulse-dot-3" />
      </div>
    </div>
  );
}
