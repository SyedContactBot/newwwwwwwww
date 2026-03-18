// Pollinations.ai API - completely free, no API key needed
const POLLINATIONS_API_URL = 'https://text.pollinations.ai/openai/chat/completions';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  pinned?: boolean;
  systemPrompt?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export const AVAILABLE_MODELS: Model[] = [
  { id: 'openai', name: 'GPT (OpenAI)', provider: 'pollinations', description: 'Fast general-purpose model' },
  { id: 'openai-large', name: 'GPT Large', provider: 'pollinations', description: 'More capable GPT model' },
  { id: 'qwen-coder', name: 'Qwen Coder', provider: 'pollinations', description: 'Optimized for code generation' },
  { id: 'llama', name: 'Llama 3.3 70B', provider: 'pollinations', description: 'Meta open-source model' },
  { id: 'mistral', name: 'Mistral Small', provider: 'pollinations', description: 'Efficient European AI model' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'pollinations', description: 'Advanced reasoning model' },
  { id: 'deepseek-r1', name: 'DeepSeek R1 (Reasoning)', provider: 'pollinations', description: 'Chain-of-thought reasoning' },
];

const DEFAULT_SYSTEM_PROMPT =
  'You are NexusAI, a highly capable, helpful, and friendly AI assistant. ' +
  'You provide clear, accurate, and well-structured responses. ' +
  'You can help with coding, writing, analysis, math, creative tasks, and general knowledge. ' +
  'Use markdown formatting when appropriate to make your responses more readable. ' +
  'For code, always use proper code blocks with language specification.';

function getSystemPrompt(customPrompt?: string): Message {
  return {
    role: 'system',
    content: customPrompt || DEFAULT_SYSTEM_PROMPT,
  };
}

// --- LocalStorage-based conversation management ---

const STORAGE_KEY = 'nexusai_conversations';
const SETTINGS_KEY = 'nexusai_settings';

export interface AppSettings {
  defaultModel: string;
  defaultSystemPrompt: string;
  sendWithEnter: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'openai',
  defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
  sendWithEnter: true,
  fontSize: 'medium',
};

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadConversations(): Record<string, Conversation> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveConversations(convs: Record<string, Conversation>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

export function listConversations(): Conversation[] {
  const convs = loadConversations();
  return Object.values(convs).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function getConversation(id: string): Conversation | null {
  const convs = loadConversations();
  return convs[id] || null;
}

export function createConversation(systemPrompt?: string): Conversation {
  const convs = loadConversations();
  const id = crypto.randomUUID();
  const conv: Conversation = {
    id,
    title: 'New Chat',
    messages: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    systemPrompt,
  };
  convs[id] = conv;
  saveConversations(convs);
  return conv;
}

export function updateConversation(conv: Conversation) {
  const convs = loadConversations();
  convs[conv.id] = conv;
  saveConversations(convs);
}

export function renameConversation(id: string, title: string) {
  const convs = loadConversations();
  if (convs[id]) {
    convs[id].title = title;
    convs[id].updated_at = new Date().toISOString();
    saveConversations(convs);
  }
}

export function deleteConversation(id: string) {
  const convs = loadConversations();
  delete convs[id];
  saveConversations(convs);
}

export function togglePinConversation(id: string) {
  const convs = loadConversations();
  if (convs[id]) {
    convs[id].pinned = !convs[id].pinned;
    saveConversations(convs);
  }
}

export function clearAllConversations() {
  saveConversations({});
}

export function exportConversation(conv: Conversation, format: 'json' | 'markdown'): string {
  if (format === 'json') {
    return JSON.stringify(conv, null, 2);
  }
  let md = '# ' + conv.title + '\n\n';
  md += '*Created: ' + new Date(conv.created_at).toLocaleString() + '*\n\n---\n\n';
  for (const msg of conv.messages) {
    if (msg.role === 'system') continue;
    const label = msg.role === 'user' ? '**You**' : '**NexusAI**';
    const time = msg.timestamp ? ' *(' + new Date(msg.timestamp).toLocaleTimeString() + ')*' : '';
    md += label + time + '\n\n' + msg.content + '\n\n---\n\n';
  }
  return md;
}

export function searchConversations(query: string): Conversation[] {
  const convs = listConversations();
  const lowerQuery = query.toLowerCase();
  return convs.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.messages.some((m) => m.content.toLowerCase().includes(lowerQuery)),
  );
}

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getCharCount(text: string): number {
  return text.length;
}

export function getConversationStats(conv: Conversation): {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  totalWords: number;
} {
  const userMsgs = conv.messages.filter((m) => m.role === 'user');
  const assistantMsgs = conv.messages.filter((m) => m.role === 'assistant');
  const totalWords = conv.messages.reduce((acc, m) => acc + getWordCount(m.content), 0);
  return {
    totalMessages: conv.messages.length,
    userMessages: userMsgs.length,
    assistantMessages: assistantMsgs.length,
    totalWords,
  };
}

// --- Streaming helper ---

function doStream(
  apiMessages: { role: string; content: string }[],
  model: string,
  conv: Conversation,
  controller: AbortController,
  onChunk: (chunk: string, convId: string) => void,
  onDone: (convId: string) => void,
  onError: (error: string) => void,
) {
  fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: apiMessages, stream: true }),
    signal: controller.signal,
  })
    .then((response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      function read() {
        reader?.read().then(({ done, value }) => {
          if (done) {
            conv.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() });
            conv.updated_at = new Date().toISOString();
            updateConversation(conv);
            onDone(conv.id);
            return;
          }
          const text = decoder.decode(value);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const lineData = line.slice(6).trim();
              if (lineData === '[DONE]') {
                conv.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() });
                conv.updated_at = new Date().toISOString();
                updateConversation(conv);
                onDone(conv.id);
                return;
              }
              try {
                const data = JSON.parse(lineData);
                const choices = data.choices || [];
                if (choices.length > 0) {
                  const delta = choices[0].delta || {};
                  const content = delta.content || '';
                  if (content) {
                    fullResponse += content;
                    onChunk(content, conv.id);
                  }
                }
              } catch {
                // skip
              }
            }
          }
          read();
        });
      }
      read();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message);
      }
    });
}

// --- Streaming chat via Pollinations.ai API (direct from browser) ---

export function streamChat(
  message: string,
  conversationId: string | null,
  model: string,
  onChunk: (chunk: string, convId: string) => void,
  onDone: (convId: string) => void,
  onError: (error: string) => void,
  customSystemPrompt?: string,
): AbortController {
  const controller = new AbortController();
  let conv: Conversation;
  if (conversationId) {
    const existing = getConversation(conversationId);
    if (existing) {
      conv = existing;
    } else {
      conv = createConversation(customSystemPrompt);
    }
  } else {
    conv = createConversation(customSystemPrompt);
  }
  conv.messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
  if (conv.messages.filter((m) => m.role === 'user').length === 1) {
    conv.title = message.length > 50 ? message.slice(0, 50) + '...' : message;
  }
  conv.updated_at = new Date().toISOString();
  updateConversation(conv);
  const systemPrompt = getSystemPrompt(conv.systemPrompt || customSystemPrompt);
  const apiMessages = [
    systemPrompt,
    ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  doStream(apiMessages, model, conv, controller, onChunk, onDone, onError);
  return controller;
}

// Regenerate the last assistant response
export function regenerateLastResponse(
  conversationId: string,
  model: string,
  onChunk: (chunk: string, convId: string) => void,
  onDone: (convId: string) => void,
  onError: (error: string) => void,
): AbortController | null {
  const conv = getConversation(conversationId);
  if (!conv) return null;
  while (conv.messages.length > 0 && conv.messages[conv.messages.length - 1].role === 'assistant') {
    conv.messages.pop();
  }
  updateConversation(conv);
  const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) return null;
  const controller = new AbortController();
  const systemPrompt = getSystemPrompt(conv.systemPrompt);
  const apiMessages = [
    systemPrompt,
    ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  doStream(apiMessages, model, conv, controller, onChunk, onDone, onError);
  return controller;
}

// Edit a user message and regenerate from that point
export function editMessageAndRegenerate(
  conversationId: string,
  messageIndex: number,
  newContent: string,
  model: string,
  onChunk: (chunk: string, convId: string) => void,
  onDone: (convId: string) => void,
  onError: (error: string) => void,
): AbortController | null {
  const conv = getConversation(conversationId);
  if (!conv) return null;
  conv.messages = conv.messages.slice(0, messageIndex);
  conv.messages.push({ role: 'user', content: newContent, timestamp: new Date().toISOString() });
  conv.updated_at = new Date().toISOString();
  updateConversation(conv);
  const controller = new AbortController();
  const systemPrompt = getSystemPrompt(conv.systemPrompt);
  const apiMessages = [
    systemPrompt,
    ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  doStream(apiMessages, model, conv, controller, onChunk, onDone, onError);
  return controller;
}
