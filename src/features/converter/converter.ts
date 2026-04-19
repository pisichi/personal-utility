import { utf8ToBase64, base64ToUtf8 } from '../../utils/decode';

export type ConversionType =
  | 'string-to-base64'
  | 'base64-to-string'
  | 'string-to-url'
  | 'url-to-string'
  | 'string-to-unicode'
  | 'unicode-to-string';

export function convert(text: string, type: ConversionType): string {
  if (!text) return '';
  
  try {
    switch (type) {
      case 'string-to-base64':
        return utf8ToBase64(text);
      case 'base64-to-string':
        return base64ToUtf8(text);
      case 'string-to-url':
        return encodeURIComponent(text);
      case 'url-to-string':
        return decodeURIComponent(text);
      case 'string-to-unicode':
        return text.split('').map(c => {
          const code = c.charCodeAt(0).toString(16).padStart(4, '0');
          return '\\u' + code;
        }).join('');
      case 'unicode-to-string':
        return text.replace(/\\u([\dA-Fa-f]{4})/g, (_, grp) =>
          String.fromCharCode(parseInt(grp, 16))
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
