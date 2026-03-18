import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, User, Bot, Edit3, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  timestamp?: string;
  messageIndex?: number;
  onEdit?: (index: number, newContent: string) => void;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export default function MessageBubble({
  role,
  content,
  isStreaming,
  timestamp,
  messageIndex,
  onEdit,
  onRegenerate,
  isLastAssistant,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const isUser = role === 'user';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit && messageIndex !== undefined && editContent.trim()) {
      onEdit(messageIndex, editContent.trim());
      setIsEditing(false);
    }
  };

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`group flex gap-4 px-4 py-6 animate-fade-in ${isUser ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isUser ? 'You' : 'NexusAI'}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm resize-none outline-none focus:border-blue-500 dark:focus:border-blue-400"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Save & Submit
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(content);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isUser ? (
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
                    <div className="relative group/code rounded-xl overflow-hidden my-3">
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

        {/* Action buttons */}
        {!isStreaming && !isEditing && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyMessage}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy message"
            >
              {copiedMessage ? <Check size={14} /> : <Copy size={14} />}
              {copiedMessage ? 'Copied' : 'Copy'}
            </button>

            {isUser && onEdit && messageIndex !== undefined && (
              <button
                onClick={() => {
                  setEditContent(content);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Edit message"
              >
                <Edit3 size={14} />
                Edit
              </button>
            )}

            {!isUser && isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
