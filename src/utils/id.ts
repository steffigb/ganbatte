function uuidFromBytes(bytes: Uint8Array): string {
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function uuidFromRandom(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Create a UUID v4 for new entity IDs (topics, items, reviews, etc.).
 *
 * Do not call `crypto.randomUUID()` elsewhere — use this helper so IDs work on
 * HTTP LAN dev URLs (`npm run dev -- --host`) where mobile browsers lack a secure
 * context. Internally prefers native `crypto.randomUUID` when available (HTTPS,
 * localhost); otherwise falls back to `getRandomValues` or `Math.random`.
 *
 * @see PLAN.md §22.19
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return uuidFromBytes(bytes);
  }

  return uuidFromRandom();
}
