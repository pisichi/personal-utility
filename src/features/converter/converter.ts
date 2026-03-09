export type ConversionType =
  | 'string-to-base64'
  | 'base64-to-string'
  | 'string-to-url'
  | 'url-to-string'
  | 'string-to-unicode'
  | 'unicode-to-string';

export function convert(text: string, type: ConversionType): string {
  try {
    switch (type) {
      case 'string-to-base64':
        return btoa(text);
      case 'base64-to-string':
        return atob(text);
      case 'string-to-url':
        return encodeURIComponent(text);
      case 'url-to-string':
        return decodeURIComponent(text);
      case 'string-to-unicode':
        return text.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
      case 'unicode-to-string':
        return text.replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
          String.fromCharCode(parseInt(match.substring(2), 16))
        );
      default:
        return 'Invalid conversion type';
    }
  } catch (error) {
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return 'An unknown error occurred.';
  }
}
