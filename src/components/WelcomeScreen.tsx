import { Sparkles, Code, FileText, Lightbulb, Globe, Zap, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: <Code size={20} />,
    title: 'Write Code',
    text: 'Write a Python function to sort a list using merge sort with detailed comments',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <FileText size={20} />,
    title: 'Explain Concepts',
    text: 'Explain how neural networks work in simple terms with examples',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Lightbulb size={20} />,
    title: 'Creative Writing',
    text: 'Write a creative short story about an AI discovering emotions',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Globe size={20} />,
    title: 'Research & Analysis',
    text: 'Compare the pros and cons of React vs Vue vs Angular for web development',
    color: 'from-green-500 to-emerald-500',
  },
];

const features = [
  { icon: <Zap size={14} />, text: 'Multiple AI Models' },
  { icon: <Shield size={14} />, text: 'Free & Unlimited' },
  { icon: <Sparkles size={14} />, text: 'Edit & Regenerate' },
  { icon: <Code size={14} />, text: 'Code Highlighting' },
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo & Title */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25 animate-float">
          <Sparkles size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">NexusAI</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Your Advanced AI Assistant
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Powered by multiple AI models. Edit messages, regenerate responses, export chats.
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
          >
            {feature.icon}
            {feature.text}
          </div>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-left hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${suggestion.color} flex items-center justify-center text-white shadow-sm`}
            >
              {suggestion.icon}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                {suggestion.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {suggestion.text}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Capabilities */}
      <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Coding Help</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Creative Writing</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Math & Science</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Analysis</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Translation</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">Unlimited Usage</span>
      </div>
    </div>
  );
}
