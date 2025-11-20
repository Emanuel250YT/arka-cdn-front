const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  (typeof window !== 'undefined'
    ? (window as any).__ARKA_CDN_API_URL__
    : undefined) ||
  '/api';

export function assembleFileUrl(fileUuid: string): string {
  if (!fileUuid) {
    throw new Error('File UUID is required');
  }
  return `${API_BASE_URL}/data/${fileUuid}`;
}

