import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, User, Bot } from 'lucide-react';
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
    <div className={`flex gap-4 px-4 py-6 animate-fade-in ${isUser ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
      </div>
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
          {isUser ? 'You' : 'NexusAI'}
        </div>
        {isUser ? (
          <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content}</div>
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
                    <div className="relative group rounded-xl overflow-hidden my-3">
                      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-950 px-4 py-2 text-xs text-gray-400">
                        <span>Code</span>
                        <button
                          onClick={() => copyToClipboard(String(codeContent), codeId)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copied === codeId ? (
                            <>
                              <Check size={14} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy
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
