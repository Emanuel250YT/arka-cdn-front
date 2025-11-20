const API_BASE_URL = 'http://localhost:4100/api';

export function assembleFileUrl(fileUuid: string): string {
  if (!fileUuid) {
    throw new Error('File UUID is required');
  }
  return `${API_BASE_URL}/data/${fileUuid}`;
}

