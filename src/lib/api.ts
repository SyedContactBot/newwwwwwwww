// Pollinations.ai API - completely free, no API key needed
const POLLINATIONS_API_URL = 'https://text.pollinations.ai/openai/chat/completions';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'flagship' | 'reasoning' | 'coding' | 'fast' | 'open-source';
}

export const AVAILABLE_MODELS: Model[] = [
  // Flagship Models
  { id: 'openai', name: 'GPT-4o', provider: 'OpenAI', description: 'Latest GPT model, fast and versatile', category: 'flagship' },
  { id: 'openai-large', name: 'GPT-4o Large', provider: 'OpenAI', description: 'Higher capacity GPT model for complex tasks', category: 'flagship' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic', description: 'Intelligent conversations and analysis', category: 'flagship' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', description: 'Google AI with search and code execution', category: 'flagship' },

  // Reasoning Models
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Advanced chain-of-thought reasoning', category: 'reasoning' },
  { id: 'qwq', name: 'QwQ 32B', provider: 'Alibaba', description: 'Reasoning-focused model by Qwen team', category: 'reasoning' },

  // Coding Models
  { id: 'qwen-coder', name: 'Qwen Coder', provider: 'Alibaba', description: 'Specialized for code generation', category: 'coding' },

  // Fast Models
  { id: 'mistral', name: 'Mistral Small', provider: 'Mistral AI', description: 'Fast and efficient for quick tasks', category: 'fast' },
  { id: 'llama', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Powerful open-weight model', category: 'fast' },

  // Open Source
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'DeepSeek', description: 'Strong open-source reasoning model', category: 'open-source' },
  { id: 'command-r', name: 'Command R', provider: 'Cohere', description: 'Optimized for RAG and tool use', category: 'open-source' },
  { id: 'phi', name: 'Phi Mini', provider: 'Microsoft', description: 'Compact but capable model', category: 'open-source' },
];

export const MODEL_CATEGORIES = [
  { id: 'flagship', label: 'Flagship', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'reasoning', label: 'Reasoning', color: 'from-amber-500 to-orange-500' },
  { id: 'coding', label: 'Coding', color: 'from-cyan-500 to-blue-500' },
  { id: 'fast', label: 'Fast', color: 'from-emerald-500 to-green-500' },
  { id: 'open-source', label: 'Open Source', color: 'from-rose-500 to-pink-500' },
] as const;

const SYSTEM_PROMPT: Message = {
  role: 'system',
  content:
    'You are NexusAI, a highly capable, helpful, and friendly AI assistant. ' +
    'You provide clear, accurate, and well-structured responses. ' +
    'You can help with coding, writing, analysis, math, creative tasks, and general knowledge. ' +
    'Use markdown formatting when appropriate to make your responses more readable. ' +
    'For code, always use proper code blocks with language specification.',
};

// --- LocalStorage-based conversation management ---

const STORAGE_KEY = 'nexusai_conversations';

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

export function createConversation(): Conversation {
  const convs = loadConversations();
  const id = crypto.randomUUID();
  const conv: Conversation = {
    id,
    title: 'New Chat',
    messages: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

// --- Streaming chat via Pollinations.ai API (direct from browser) ---

export function streamChat(
  message: string,
  conversationId: string | null,
  model: string,
  onChunk: (chunk: string, convId: string) => void,
  onDone: (convId: string) => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();

  // Get or create conversation
  let conv: Conversation;
  if (conversationId) {
    const existing = getConversation(conversationId);
    if (existing) {
      conv = existing;
    } else {
      conv = createConversation();
    }
  } else {
    conv = createConversation();
  }

  // Add user message
  conv.messages.push({ role: 'user', content: message });

  // Auto-title from first message
  if (conv.messages.filter((m) => m.role === 'user').length === 1) {
    conv.title = message.length > 50 ? message.slice(0, 50) + '...' : message;
  }

  conv.updated_at = new Date().toISOString();
  updateConversation(conv);

  // Build messages for API (include system prompt)
  const apiMessages = [
    SYSTEM_PROMPT,
    ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
    }),
    signal: controller.signal,
  })
    .then((response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      function read() {
        reader?.read().then(({ done, value }) => {
          if (done) {
            // Save the assistant response
            conv.messages.push({ role: 'assistant', content: fullResponse });
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
                conv.messages.push({ role: 'assistant', content: fullResponse });
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
                // Skip malformed JSON
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

  return controller;
}
