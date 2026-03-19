import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const isUser = role === 'user';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`flex gap-4 px-4 py-5 animate-fade-in ${isUser ? '' : 'bg-white/40 dark:bg-white/[0.02]'}`}>
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20'
              : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-violet-500/20'
          }`}
        >
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>
      </div>
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {isUser ? 'You' : 'NexusAI'}
        </div>
        {isUser ? (
          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{content}</div>
        ) : (
          <div className={`markdown-content text-gray-800 dark:text-gray-200 ${isStreaming ? 'typing-cursor' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre({ children, ...props }) {
                  const codeContent =
                    children &&
                    typeof children === 'object' &&
                    'props' in (children as React.ReactElement)
                      ? ((children as React.ReactElement).props as { children?: string }).children || ''
                      : '';
                  const codeId = `code-${Math.random()}`;
                  return (
                    <div className="relative group rounded-xl overflow-hidden my-3 border border-gray-200/50 dark:border-white/5">
                      <div className="flex items-center justify-between bg-gray-800 dark:bg-[#0d1117] px-4 py-2 text-xs text-gray-400">
                        <span className="font-medium">Code</span>
                        <button
                          onClick={() => copyToClipboard(String(codeContent), codeId)}
                          className="flex items-center gap-1.5 hover:text-white transition-all duration-200 px-2 py-0.5 rounded-md hover:bg-white/10"
                        >
                          {copied === codeId ? (
                            <>
                              <Check size={13} className="text-emerald-400" /> <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre {...props} className="!mt-0 !rounded-t-none">
                        {children}
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
