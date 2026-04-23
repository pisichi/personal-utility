export function detectFormatType(text: string): 'json' | 'xml' | 'text' {
  if (!text) return 'text';
  const trimmed = text.trim();
  if (!trimmed) return 'text';

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch (e) {
    }
  }

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    if (trimmed.includes('<?xml') || /<[a-z0-9]+[^>]*>[\s\S]*<\/[a-z0-9]+>/i.test(trimmed) || /<[a-z0-9]+[^>]*\/>/i.test(trimmed)) {
      return 'xml';
    }
  }

  return 'text';
}
