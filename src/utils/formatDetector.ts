
export function detectFormatType(text: string): 'json' | 'xml' | 'text' {
  text = text.trim();
  if (!text) return 'text';

  // Try JSON first
  try {
    JSON.parse(text);
    return 'json';
  } catch (e) {
    // Not JSON, try XML
  }

  // Basic XML detection
  // Looks for a starting '<' and an ending '>' and some common XML patterns
  if (text.startsWith('<') && text.endsWith('>')) {
    if (text.includes('<') && text.includes('/>') || text.includes('<?xml')) {
      return 'xml';
    }
  }

  return 'text'; // Cannot determine
}
