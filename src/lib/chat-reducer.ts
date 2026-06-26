// src/lib/chat-reducer.ts
//
// Pure, typed reducer for the KITE AI Assistant chat panel (Req 9.3). State is
// session-only and managed entirely in React; this module owns the transition
// logic so message/loading/error handling is testable in isolation. No I/O.

import type {
  AssistantResponse,
  ChatAction,
  ChatMessage,
  ChatState,
} from '@/types';

/** Maximum user→assistant exchanges before prompting a fresh start (Req 9.7). */
export const MAX_EXCHANGES = 20;

export const INITIAL_CHAT_STATE: ChatState = {
  messages: [],
  input: '',
  loading: false,
  error: null,
  exchanges: 0,
};

let messageCounter = 0;
/** Deterministic-enough monotonic id for React keys (not synthetic data). */
function nextMessageId(role: string): string {
  messageCounter += 1;
  return `msg-${role}-${messageCounter}`;
}

/** Build a user message from raw input text. */
export function makeUserMessage(content: string): ChatMessage {
  return { id: nextMessageId('user'), role: 'user', content };
}

/** Build an assistant message from a response. */
export function makeAssistantMessage(response: AssistantResponse): ChatMessage {
  return {
    id: nextMessageId('assistant'),
    role: 'assistant',
    content: response.text,
    suggestions: response.suggestions,
  };
}

/**
 * Pure chat reducer. `SEND` appends exactly one user message, clears the input
 * and any prior error, and increments `exchanges` by one. `START_LOADING` sets
 * the loading flag. `RECEIVE` appends an assistant message and clears loading
 * and error. `ERROR` records an error and clears loading. `CLEAR` resets to the
 * initial state (Property 7).
 */
export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.value };
    case 'SEND':
      return {
        ...state,
        messages: [...state.messages, action.message],
        input: '',
        error: null,
        exchanges: state.exchanges + 1,
      };
    case 'START_LOADING':
      return { ...state, loading: true, error: null };
    case 'RECEIVE':
      return {
        ...state,
        messages: [...state.messages, action.message],
        loading: false,
        error: null,
      };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'CLEAR':
      return { ...INITIAL_CHAT_STATE };
    default:
      return state;
  }
}

/** True once the conversation has reached the exchange cap (Req 9.7). */
export function isAtExchangeCap(state: ChatState): boolean {
  return state.exchanges >= MAX_EXCHANGES;
}
