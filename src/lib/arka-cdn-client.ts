/**
 * Cliente SDK para Arka CDN
 * Proporciona una interfaz simple para interactuar con la API de Arka CDN
 */

import { assembleFileUrl } from '@/utils/url';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
    arkivAddresses: string[];
    totalSize: number;
    originalSize: number;
    compressed: boolean;
    chunks: number;
    status: string;
    publicUrl: string;
  };
}

export interface UploadStatus {
  success: boolean;
  data: {
    fileId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalChunks: number;
    uploadedChunks: number;
    failedChunks: number;
    retryCount: number;
    lastError: string | null;
    chunks: Array<{
      chunkIndex: number;
      status: string;
      arkivAddress: string;
      txHash?: string;
    }>;
  };
}

export interface FileChunk {
  id: string;
  chunkIndex: number;
  arkivAddress: string;
  size: number;
  txHash?: string;
  uploadStatus: string;
  retryCount: number;
  createdAt: string;
}

export interface FileInfo {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  isDashVideo: boolean;
  createdAt: string;
  expiresAt: string | null;
  publicUrl: string;
  chunks?: FileChunk[];
}

export interface UploadOptions {
  description?: string;
  compress?: boolean;
  ttl?: number;
}

export interface WalletQueue {
  queueIndex: number;
  walletAddress: string;
  pendingChunks: number;
  isProcessing: boolean;
  successCount: number;
  failedCount?: number;
  errorCount?: number;
}

export interface WalletPoolStats {
  success: boolean;
  data: {
    queues: WalletQueue[];
    totalWallets: number;
  };
}

export interface EntityUpdateData {
  title?: string;
  content?: string;
  description?: string;
  expirationHours?: number;
  customData?: Record<string, unknown>;
}

export interface EntityQueryFilters {
  type?: string;
  fileName?: string;
  withAttributes?: boolean;
  withPayload?: boolean;
  limit?: number;
}

export interface EntityQueryResponse {
  success: boolean;
  message: string;
  data: Array<{
    entityKey: string;
    attributes?: Record<string, unknown>;
    payload?: {
      data: string;
    };
    createdAt: number;
  }>;
  meta: {
    total: number;
    filters: Record<string, unknown>;
    options: Record<string, unknown>;
  };
}

export interface FileTextResponse {
  success: boolean;
  data: {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    content: string;
    encoding: string;
  };
}

export interface FileJsonResponse {
  success: boolean;
  data: {
    fileId: string;
    originalName: string;
    data: unknown;
  };
}

export type SessionType = 'test' | 'user';

export class ArkaCDNClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionType: SessionType;

  constructor(baseUrl: string = 'http://localhost:4100/api', sessionType: SessionType = 'user') {
    this.baseUrl = baseUrl;
    this.sessionType = sessionType;
    if (typeof window !== 'undefined') {
      const accessKey = sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
      const refreshKey = sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
      this.accessToken = localStorage.getItem(accessKey);
      this.refreshToken = localStorage.getItem(refreshKey);
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(email: string, password: string, name?: string) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Inicia sesión y guarda los tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;

    if (typeof window !== 'undefined') {
      const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
      const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
      localStorage.setItem(accessKey, data.accessToken);
      localStorage.setItem(refreshKey, data.refreshToken);
    }

    return data;
  }

  /**
   * Refresca el access token
   */
  async refreshAccessToken(): Promise<LoginResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;

    if (typeof window !== 'undefined') {
      const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
      const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
      localStorage.setItem(accessKey, data.accessToken);
      localStorage.setItem(refreshKey, data.refreshToken);
    }

    return data;
  }

  /**
   * Cierra la sesión
   */
  async logout() {
    if (!this.accessToken) return;

    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
    } catch {
    }

    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
      const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
      localStorage.removeItem(accessKey);
      localStorage.removeItem(refreshKey);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile() {
    return this.request('GET', '/auth/me');
  }

  /**
   * Sube un archivo
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (options.description) {
      formData.append('description', options.description);
    }
    if (options.compress !== undefined) {
      formData.append('compress', String(options.compress));
    }
    if (options.ttl) {
      formData.append('ttl', String(options.ttl));
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${this.baseUrl}/upload/file`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(formData);
    });
  }

  /**
   * Obtiene el estado de subida de un archivo
   */
  async getUploadStatus(fileId: string): Promise<UploadStatus> {
    return this.request('GET', `/upload/${fileId}/status`);
  }

  /**
   * Lista todos los archivos del usuario
   */
  async listFiles(): Promise<{ success: boolean; data: FileInfo[] }> {
    return this.request('GET', '/upload');
  }

  /**
   * Obtiene información de un archivo específico
   */
  async getFile(fileId: string) {
    return this.request('GET', `/upload/${fileId}`);
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(fileId: string) {
    return this.request('DELETE', `/upload/${fileId}`);
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(fileId: string): string {
    return assembleFileUrl(fileId);
  }

  /**
   * Sube datos en texto plano o JSON
   */
  async uploadPlainText(
    data: string | object,
    filename: string,
    description?: string
  ): Promise<UploadResponse> {
    return this.request('POST', '/upload/plain', {
      body: JSON.stringify({ data, filename, description }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Obtiene el contenido de un archivo como texto
   */
  async getFileAsText(fileId: string): Promise<FileTextResponse> {
    return this.request('GET', `/upload/${fileId}/text`);
  }

  /**
   * Obtiene y parsea automáticamente un archivo JSON
   */
  async getFileAsJson(fileId: string): Promise<FileJsonResponse> {
    return this.request('GET', `/upload/${fileId}/json`);
  }

  /**
   * Obtiene estadísticas del pool de subida y wallets
   */
  async getWalletPoolStats(): Promise<WalletPoolStats> {
    return this.request('GET', '/upload/stats/wallet-pool');
  }

  /**
   * Actualiza una entidad existente en Arkiv Network
   */
  async updateEntity(
    entityKey: string,
    updateData: EntityUpdateData
  ): Promise<{ success: boolean; message: string; data: { entityKey: string; txHash: string } }> {
    return this.request('PUT', `/data/${entityKey}`, {
      body: JSON.stringify(updateData),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Consulta entidades en Arkiv Network usando filtros
   */
  async queryEntities(filters: EntityQueryFilters): Promise<EntityQueryResponse> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.fileName) params.append('fileName', filters.fileName);
    if (filters.withAttributes !== undefined) {
      params.append('withAttributes', String(filters.withAttributes));
    }
    if (filters.withPayload !== undefined) {
      params.append('withPayload', String(filters.withPayload));
    }
    if (filters.limit) params.append('limit', String(filters.limit));

    return this.request('GET', `/data/query?${params.toString()}`);
  }

  /**
   * Helper para hacer requests autenticados
   */
  private async request(
    method: string,
    endpoint: string,
    options: {
      body?: BodyInit;
      headers?: Record<string, string>;
    } = {}
  ) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: options.body,
    });

    if (response.status === 401) {
      try {
        await this.refreshAccessToken();
        headers.Authorization = `Bearer ${this.accessToken}`;

        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: options.body,
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json();
          throw new Error(error.message || `Request failed: ${retryResponse.statusText}`);
        }

        return retryResponse.json();
      } catch (refreshError) {
        this.accessToken = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
          const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
          const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
          localStorage.removeItem(accessKey);
          localStorage.removeItem(refreshKey);
        }
        throw refreshError;
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

