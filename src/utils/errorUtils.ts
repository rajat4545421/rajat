/**
 * Cleans and formats raw API error strings, stripping JSON blobs
 * and turning 503 high-demand or rate-limit errors into clear student-friendly advice.
 */
export function formatCleanErrorMessage(err: unknown, defaultMessage = 'An error occurred. Please try again.'): string {
  if (!err) return defaultMessage;
  let msg = typeof err === 'string' ? err : (err as any)?.message || String(err);

  try {
    if (typeof msg === 'string' && (msg.trim().startsWith('{') || msg.includes('{"error":'))) {
      const jsonStart = msg.indexOf('{');
      const jsonEnd = msg.lastIndexOf('}') + 1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(msg.slice(jsonStart, jsonEnd));
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        } else if (parsed?.error && typeof parsed.error === 'string') {
          msg = parsed.error;
        } else if (parsed?.message) {
          msg = parsed.message;
        }
      }
    }
  } catch (_) {
    // Keep msg as is if JSON parsing fails
  }

  const lower = msg.toLowerCase();
  if (lower.includes('high demand') || lower.includes('503') || lower.includes('unavailable')) {
    return 'Zygard AI is experiencing high demand. Retrying in a few moments usually resolves this.';
  }
  if (lower.includes('quota') || lower.includes('429')) {
    return 'AI study request limit reached. Please wait a moment before trying again.';
  }

  return msg || defaultMessage;
}
