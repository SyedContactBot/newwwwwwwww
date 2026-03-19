import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-5 bg-white/40 dark:bg-white/[0.02] animate-fade-in">
      <div className="flex-shrink-0 pt-0.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm shadow-violet-500/20">
          <Sparkles size={14} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">NexusAI</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500 pulse-dot-1" />
          <div className="w-2 h-2 rounded-full bg-fuchsia-400 dark:bg-fuchsia-500 pulse-dot-2" />
          <div className="w-2 h-2 rounded-full bg-pink-400 dark:bg-pink-500 pulse-dot-3" />
        </div>
      </div>
    </div>
  );
}
