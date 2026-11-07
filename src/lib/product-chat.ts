const configuredUrl = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_CHAT_API_URL?.trim();
export const chatApiUrl = configuredUrl?.replace(/\/+$/, '') || '';
const chatSessionStorageKey = 'opscore-chat-session-id';
const chatSessionId =
  sessionStorage.getItem(chatSessionStorageKey) ||
  globalThis.crypto?.randomUUID?.() ||
  `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
sessionStorage.setItem(chatSessionStorageKey, chatSessionId);
export async function requestProductReply(messages: { role: 'user' | 'assistant'; text: string }[], signal: AbortSignal): Promise<string> {
  const response = await fetch(`${chatApiUrl}/api/v1/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Chat-Session-Id': chatSessionId }, signal,
    body: JSON.stringify({ messages: messages.slice(-6).map(m => ({ role: m.role, content: m.text.slice(0, 2000) })) }),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Batas penggunaan demo tercapai. Coba lagi nanti atau gunakan FAQ.');
    throw new Error('AI belum dapat dihubungi. Coba lagi atau gunakan FAQ.');
  }
  const data = await response.json();
  if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Jawaban AI tidak tersedia.');
  return data.reply;
}
