export function nowIso(): string {
  return new Date().toISOString();
}

export function formatRelativeTime(isoDate?: string, neverLabel = 'Never'): string {
  if (!isoDate) {
    return neverLabel;
  }

  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString();
}
