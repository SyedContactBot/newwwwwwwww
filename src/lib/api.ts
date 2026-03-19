// Multiple free API endpoints for reliability (no API key needed)
const API_ENDPOINTS = [
  'https://gen.pollinations.ai/v1/chat/completions',
  'https://text.pollinations.ai/openai/chat/completions',
];

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
  category: 'flagship' | 'reasoning' | 'coding' | 'fast' | 'search' | 'open-source';
}

// All models verified against the live Pollinations.ai /v1/models endpoint
export const AVAILABLE_MODELS: Model[] = [
  // Flagship Models
  { id: 'openai', name: 'GPT-4o', provider: 'OpenAI', description: 'Latest GPT model, fast and versatile', category: 'flagship' },
  { id: 'openai-large', name: 'GPT-4o Large', provider: 'OpenAI', description: 'Higher capacity GPT with reasoning', category: 'flagship' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic', description: 'Intelligent conversations and analysis', category: 'flagship' },
  { id: 'claude-large', name: 'Claude Large', provider: 'Anthropic', description: 'Most capable Claude for complex tasks', category: 'flagship' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', description: 'Google AI with search and code execution', category: 'flagship' },
  { id: 'gemini-large', name: 'Gemini Large', provider: 'Google', description: 'Largest Gemini model for complex tasks', category: 'flagship' },
  { id: 'grok', name: 'Grok', provider: 'xAI', description: 'xAI model with real-time knowledge', category: 'flagship' },

  // Reasoning Models
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'DeepSeek', description: 'Advanced chain-of-thought reasoning', category: 'reasoning' },
  { id: 'perplexity-reasoning', name: 'Perplexity Reasoning', provider: 'Perplexity', description: 'Deep reasoning with citations', category: 'reasoning' },
  { id: 'kimi', name: 'Kimi', provider: 'Moonshot', description: 'Long-context reasoning model', category: 'reasoning' },

  // Coding Models
  { id: 'qwen-coder', name: 'Qwen Coder', provider: 'Alibaba', description: 'Specialized for code generation', category: 'coding' },

  // Fast Models
  { id: 'openai-fast', name: 'GPT-4o Fast', provider: 'OpenAI', description: 'Optimized for quick responses', category: 'fast' },
  { id: 'claude-fast', name: 'Claude Fast', provider: 'Anthropic', description: 'Fast Claude for quick tasks', category: 'fast' },
  { id: 'gemini-fast', name: 'Gemini Flash', provider: 'Google', description: 'Ultra-fast Gemini responses', category: 'fast' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', description: 'Fast and efficient for quick tasks', category: 'fast' },
  { id: 'nova-fast', name: 'Nova Fast', provider: 'Amazon', description: 'Fast lightweight model', category: 'fast' },
  { id: 'perplexity-fast', name: 'Perplexity Fast', provider: 'Perplexity', description: 'Quick answers with sources', category: 'fast' },

  // Search Models
  { id: 'gemini-search', name: 'Gemini Search', provider: 'Google', description: 'AI-powered search with real-time info', category: 'search' },

  // Open Source
  { id: 'glm', name: 'GLM', provider: 'Zhipu AI', description: 'Strong open-source bilingual model', category: 'open-source' },
  { id: 'minimax', name: 'MiniMax', provider: 'MiniMax', description: 'Versatile open model', category: 'open-source' },
  { id: 'step-3.5-flash', name: 'Step 3.5 Flash', provider: 'StepFun', description: 'Fast open-source model', category: 'open-source' },
];

export const MODEL_CATEGORIES = [
  { id: 'flagship', label: 'Flagship', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'reasoning', label: 'Reasoning', color: 'from-amber-500 to-orange-500' },
  { id: 'coding', label: 'Coding', color: 'from-cyan-500 to-blue-500' },
  { id: 'fast', label: 'Fast', color: 'from-emerald-500 to-green-500' },
  { id: 'search', label: 'Search', color: 'from-sky-500 to-indigo-500' },
  { id: 'open-source', label: 'Open Source', color: 'from-rose-500 to-pink-500' },
] as const;

// Fallback order: if the selected model fails, try these in order
const FALLBACK_MODELS = ['openai', 'gemini', 'claude', 'openai-fast', 'mistral'];

const SYSTEM_PROMPT: Message = {
  role: 'system',
  content:
    'You are NexusAI, a highly capable, helpful, and friendly AI assistant. ' +
    'You provide clear, accurate, and well-structured responses. ' +
    'You can help with coding, writing, analysis, math, creative tasks, and general knowledge. ' +
    'Use markdown formatting when appropriate to make your responses more readable. ' +
    'For code, always use proper code blocks with language specification. ' +
    'Always give complete, thorough answers. Never refuse to answer or say you cannot help.',
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

// --- Helper: Try streaming from a specific endpoint + model ---

interface StreamAttemptCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (fullResponse: string) => void;
  onError: (error: string) => void;
}

function attemptStream(
  endpoint: string,
  model: string,
  apiMessages: { role: string; content: string }[],
  signal: AbortSignal,
  callbacks: StreamAttemptCallbacks,
) {
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
    }),
    signal,
  })
    .then((response) => {
      if (!response.ok) {
        callbacks.onError(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError('No response body');
        return;
      }

      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      function read() {
        reader!.read().then(({ done, value }) => {
          if (done) {
            callbacks.onDone(fullResponse);
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const lineData = trimmed.slice(6).trim();
            if (lineData === '[DONE]') {
              callbacks.onDone(fullResponse);
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
                  callbacks.onChunk(content);
                }
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }

          read();
        }).catch((err: Error) => {
          if (err.name !== 'AbortError') {
            if (fullResponse.length > 0) {
              // We got partial content, treat as done
              callbacks.onDone(fullResponse);
            } else {
              callbacks.onError(err.message);
            }
          }
        });
      }

      read();
    })
    .catch((err: Error) => {
      if (err.name !== 'AbortError') {
        callbacks.onError(err.message);
      }
    });
}

// --- Streaming chat with automatic fallback ---

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

  // Generate all endpoint+model combinations to try
  const attempts: { endpoint: string; model: string }[] = [];
  // First try the selected model on all endpoints
  for (const ep of API_ENDPOINTS) {
    attempts.push({ endpoint: ep, model });
  }
  // Then try fallback models on all endpoints
  for (const fallbackModel of FALLBACK_MODELS) {
    if (fallbackModel === model) continue;
    for (const ep of API_ENDPOINTS) {
      attempts.push({ endpoint: ep, model: fallbackModel });
    }
  }

  let attemptIndex = 0;

  function tryNext() {
    if (controller.signal.aborted) return;

    if (attemptIndex >= attempts.length) {
      onError('All models and endpoints failed. Please try again.');
      return;
    }

    const current = attempts[attemptIndex];
    attemptIndex++;

    attemptStream(
      current.endpoint,
      current.model,
      apiMessages,
      controller.signal,
      {
        onChunk: (chunk) => {
          onChunk(chunk, conv.id);
        },
        onDone: (fullResponse) => {
          if (fullResponse.length > 0) {
            conv.messages.push({ role: 'assistant', content: fullResponse });
            conv.updated_at = new Date().toISOString();
            updateConversation(conv);
            onDone(conv.id);
          } else {
            // Empty response — treat as failure and try next
            tryNext();
          }
        },
        onError: () => {
          // Try the next model/endpoint combination
          tryNext();
        },
      },
    );
  }

  tryNext();

  return controller;
}
