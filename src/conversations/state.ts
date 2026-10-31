/**
 * Conversation state per phone number (menu position, language, pending handover).
 * In-memory placeholder; the gateway's own tables (its own schema and database role) replace it.
 */
export interface Conversation {
  phone: string;
  language: 'en' | 'hi';
  step: string;
  updatedAt: number;
}

const store = new Map<string, Conversation>();

export function getConversation(phone: string): Conversation {
  const c = store.get(phone) ?? { phone, language: 'en', step: 'start', updatedAt: Date.now() };
  store.set(phone, c);
  return c;
}

export function updateConversation(phone: string, patch: Partial<Conversation>): Conversation {
  const next = { ...getConversation(phone), ...patch, updatedAt: Date.now() };
  store.set(phone, next);
  return next;
}
