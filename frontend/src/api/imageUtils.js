export function resolveImageUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
  return rawUrl;
}

export function isPlaceholderUrl(rawUrl) {
  return !rawUrl || rawUrl.includes('placeholder');
}
