
export function detectFormatType(text: string): 'json' | 'xml' | 'text' {
  if (!text) return 'text';
  const trimmed = text.trim();
  if (!trimmed) return 'text';

  // Try JSON first
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch (e) {
      // Not valid JSON, continue
    }
  }

  // Basic XML detection
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    // Check for some common XML markers
    if (trimmed.includes('<?xml') || /<[a-z0-9]+[^>]*>[\s\S]*<\/[a-z0-9]+>/i.test(trimmed) || /<[a-z0-9]+[^>]*\/>/i.test(trimmed)) {
      return 'xml';
    }
  }

  return 'text'; // Cannot determine
}
