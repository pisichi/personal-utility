/**
 * UTF-8 safe base64 encoding/decoding
 */

export const utf8ToBase64 = (str: string): string => {
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
};

export const base64ToUtf8 = (base64String: string): string => {
  try {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Failed to decode base64 string", e);
    throw e;
  }
};
