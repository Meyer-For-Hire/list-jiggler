export function encodeUrlSafeBase64(str: string): string {
  try {
    let base64: string;
    if (typeof window === 'undefined') {
      // Server-side encoding
      base64 = Buffer.from(str).toString('base64');
    } else {
      // Client-side encoding
      base64 = window.btoa(unescape(encodeURIComponent(str)));
    }
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error('Failed to encode:', e);
    return '';
  }
}

export function decodeUrlSafeBase64(str: string): string {
  try {
    // Add padding if needed
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
    
    if (typeof window === 'undefined') {
      // Server-side decoding
      return Buffer.from(base64, 'base64').toString();
    } else {
      // Client-side decoding
      return decodeURIComponent(escape(window.atob(base64)));
    }
  } catch (e) {
    console.error('Failed to decode:', e);
    return '';
  }
} 