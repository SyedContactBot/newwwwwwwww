import { Sparkles, Code, FileText, Lightbulb, Globe, Zap, Brain } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: <Code size={18} />,
    title: 'Write Code',
    text: 'Write a Python function to sort a list using merge sort with detailed comments',
    color: 'from-cyan-500 to-blue-500',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: <Brain size={18} />,
    title: 'Explain Concepts',
    text: 'Explain how neural networks work in simple terms with examples',
    color: 'from-violet-500 to-fuchsia-500',
    glow: 'group-hover:shadow-violet-500/20',
  },
  {
    icon: <Lightbulb size={18} />,
    title: 'Creative Writing',
    text: 'Write a creative short story about an AI discovering emotions',
    color: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: <Globe size={18} />,
    title: 'Research & Analysis',
    text: 'Compare the pros and cons of React vs Vue vs Angular for web development',
    color: 'from-emerald-500 to-green-500',
    glow: 'group-hover:shadow-emerald-500/20',
  },
];

const capabilities = [
  { icon: <Zap size={12} />, label: '21+ AI Models' },
  { icon: <Code size={12} />, label: 'Coding' },
  { icon: <FileText size={12} />, label: 'Writing' },
  { icon: <Brain size={12} />, label: 'Reasoning' },
  { icon: <Globe size={12} />, label: 'Analysis' },
  { icon: <Sparkles size={12} />, label: 'Unlimited' },
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      {/* Logo & Title */}
      <div className="mb-10 text-center">
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-xl shadow-violet-500/20 animate-float">
            <Sparkles size={36} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-3 tracking-tight">
          <span className="gradient-text">NexusAI</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          Your Free & Unlimited AI Assistant
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 max-w-md mx-auto">
          Powered by 21+ cutting-edge AI models. No API keys, no limits, no costs.
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={`group flex items-start gap-3.5 p-4 rounded-2xl border border-gray-200/80 dark:border-white/5 bg-white/60 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] transition-all duration-300 text-left hover:shadow-lg ${suggestion.glow} hover:border-gray-300/80 dark:hover:border-white/10 hover:-translate-y-0.5`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
            >
              {suggestion.icon}
            </div>
            <div className="pt-0.5">
              <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {suggestion.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {suggestion.text}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Capabilities */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {capabilities.map((cap, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 hover:border-violet-300/50 dark:hover:border-violet-500/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 cursor-default"
          >
            {cap.icon}
            {cap.label}
          </span>
        ))}
      </div>
    </div>
  );
}
