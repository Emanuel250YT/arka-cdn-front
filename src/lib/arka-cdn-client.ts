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

export interface RequestResponseData {
  id: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  timestamp: Date;
  error?: string;
}

export type RequestResponseCallback = (data: RequestResponseData) => void;

export class ArkaCDNClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionType: SessionType;
  private requestResponseCallback?: RequestResponseCallback;

  private baseURL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  (typeof window !== "undefined"
    ? (window as unknown as { __ARKA_CDN_API_URL__: string }).__ARKA_CDN_API_URL__
    : undefined) ||
  "/api";

  constructor(baseUrl: string = this.baseURL, sessionType: SessionType = 'user', requestResponseCallback?: RequestResponseCallback) {
    this.baseUrl = baseUrl;
    this.sessionType = sessionType;
    this.requestResponseCallback = requestResponseCallback;
    if (typeof window !== 'undefined') {
      const accessKey = sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
      const refreshKey = sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
      this.accessToken = localStorage.getItem(accessKey);
      this.refreshToken = localStorage.getItem(refreshKey);
    }
  }

  /**
   * Establece el callback para capturar request/response
   */
  setRequestResponseCallback(callback: RequestResponseCallback | undefined) {
    this.requestResponseCallback = callback;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(email: string, password: string, name?: string) {
    const url = `${this.baseUrl}/auth/register`;
    const requestBody = { email, password, name };
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      let responseBody: unknown = null;
      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = null;
      }

      if (!response.ok) {
        throw new Error(
          typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
            ? String(responseBody.message)
            : 'Registration failed'
        );
      }

      return responseBody as { accessToken: string; refreshToken: string; user: { id: string; email: string; name?: string } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia sesión y guarda los tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `${this.baseUrl}/auth/login`;
    const requestBody = { email, password };
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      let responseBody: unknown = null;
      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = null;
      }

      if (!response.ok) {
        throw new Error(
          typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
            ? String(responseBody.message)
            : 'Login failed'
        );
      }

      const data = responseBody as LoginResponse;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;

      if (typeof window !== 'undefined') {
        const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
        const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
        localStorage.setItem(accessKey, data.accessToken);
        localStorage.setItem(refreshKey, data.refreshToken);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresca el access token
   */
  async refreshAccessToken(): Promise<LoginResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const url = `${this.baseUrl}/auth/refresh`;
    const requestBody = { refreshToken: this.refreshToken };
    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      let responseBody: unknown = null;
      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = null;
      }

      if (!response.ok) {
        throw new Error(
          typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
            ? String(responseBody.message)
            : 'Token refresh failed'
        );
      }

      const data = responseBody as LoginResponse;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;

      if (typeof window !== 'undefined') {
        const accessKey = this.sessionType === 'test' ? 'arka_test_access_token' : 'arka_user_access_token';
        const refreshKey = this.sessionType === 'test' ? 'arka_test_refresh_token' : 'arka_user_refresh_token';
        localStorage.setItem(accessKey, data.accessToken);
        localStorage.setItem(refreshKey, data.refreshToken);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cierra la sesión
   */
  async logout() {
    if (!this.accessToken) return;

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.baseUrl}/auth/logout`;
    const headers = { Authorization: `Bearer ${this.accessToken}` };

    const requestData: RequestResponseData = {
      id: requestId,
      method: 'POST',
      url,
      requestHeaders: headers,
      timestamp: new Date(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody: unknown = null;
      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = null;
      }

      const finalData: RequestResponseData = {
        ...requestData,
        responseStatus: response.status,
        responseHeaders,
        responseBody,
      };
      if (this.requestResponseCallback) {
        this.requestResponseCallback(finalData);
      }
    } catch (error) {
      const errorData: RequestResponseData = {
        ...requestData,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      if (this.requestResponseCallback) {
        this.requestResponseCallback(errorData);
      }
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

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.baseUrl}/upload/file`;
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

    // Capturar request body para el visualizador
    const requestBody: Record<string, unknown> = {
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        _isFile: true,
      },
    };
    if (options.description) requestBody.description = options.description;
    if (options.compress !== undefined) requestBody.compress = options.compress;
    if (options.ttl) requestBody.ttl = options.ttl;

    const requestData: RequestResponseData = {
      id: requestId,
      method: 'POST',
      url,
      requestHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      requestBody,
      timestamp: new Date(),
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        const responseHeaders: Record<string, string> = {};
        const allHeaders = xhr.getAllResponseHeaders();
        if (allHeaders) {
          allHeaders.split('\r\n').forEach((line) => {
            const parts = line.split(': ');
            if (parts.length === 2) {
              responseHeaders[parts[0]] = parts[1];
            }
          });
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const finalData: RequestResponseData = {
              ...requestData,
              responseStatus: xhr.status,
              responseHeaders,
              responseBody: data,
            };
            if (this.requestResponseCallback) {
              this.requestResponseCallback(finalData);
            }
            resolve(data);
          } catch {
            const errorData: RequestResponseData = {
              ...requestData,
              responseStatus: xhr.status,
              responseHeaders,
              error: 'Invalid response format',
            };
            if (this.requestResponseCallback) {
              this.requestResponseCallback(errorData);
            }
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            const errorData: RequestResponseData = {
              ...requestData,
              responseStatus: xhr.status,
              responseHeaders,
              responseBody: error,
              error: error.message || 'Upload failed',
            };
            if (this.requestResponseCallback) {
              this.requestResponseCallback(errorData);
            }
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            const errorData: RequestResponseData = {
              ...requestData,
              responseStatus: xhr.status,
              responseHeaders,
              error: `Upload failed: ${xhr.statusText}`,
            };
            if (this.requestResponseCallback) {
              this.requestResponseCallback(errorData);
            }
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        const errorData: RequestResponseData = {
          ...requestData,
          error: 'Network error',
        };
        if (this.requestResponseCallback) {
          this.requestResponseCallback(errorData);
        }
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(formData);
    });
  }

  /**
   * Obtiene el estado de subida de un archivo
   */
  async getUploadStatus(fileId: string): Promise<UploadStatus> {
    return this.request('GET', `/upload/${fileId}/status`) as Promise<UploadStatus>;
  }

  /**
   * Lista todos los archivos del usuario
   */
  async listFiles(): Promise<{ success: boolean; data: FileInfo[] }> {
    return this.request('GET', '/upload') as Promise<{ success: boolean; data: FileInfo[] }>;
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
    }) as Promise<UploadResponse>;
  }

  /**
   * Obtiene el contenido de un archivo como texto
   */
  async getFileAsText(fileId: string): Promise<FileTextResponse> {
    return this.request('GET', `/upload/${fileId}/text`) as Promise<FileTextResponse>;
  }

  /**
   * Obtiene y parsea automáticamente un archivo JSON
   */
  async getFileAsJson(fileId: string): Promise<FileJsonResponse> {
    return this.request('GET', `/upload/${fileId}/json`) as Promise<FileJsonResponse>;
  }

  /**
   * Obtiene estadísticas del pool de subida y wallets
   */
  async getWalletPoolStats(): Promise<WalletPoolStats> {
    return this.request('GET', '/upload/stats/wallet-pool') as Promise<WalletPoolStats>;
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
    }) as Promise<{ success: boolean; message: string; data: { entityKey: string; txHash: string } }>;
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

    return this.request('GET', `/data/query?${params.toString()}`) as Promise<EntityQueryResponse>;
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
  ): Promise<unknown> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call login() first.');
    }

    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    // Capturar request body
    let requestBody: unknown = null;
    if (options.body) {
      if (options.body instanceof FormData) {
        // Para FormData, crear un objeto con las claves
        const formDataObj: Record<string, unknown> = {};
        options.body.forEach((value, key) => {
          if (value instanceof File) {
            formDataObj[key] = {
              name: value.name,
              size: value.size,
              type: value.type,
              _isFile: true,
            };
          } else {
            formDataObj[key] = value;
          }
        });
        requestBody = formDataObj;
      } else if (typeof options.body === 'string') {
        try {
          requestBody = JSON.parse(options.body);
        } catch {
          requestBody = options.body;
        }
      } else {
        requestBody = options.body;
      }
    }

    const requestData: RequestResponseData = {
      id: requestId,
      method,
      url,
      requestHeaders: headers,
      requestBody,
      timestamp: new Date(),
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body,
      });

      // Capturar response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (response.status === 401) {
        try {
          await this.refreshAccessToken();
          headers.Authorization = `Bearer ${this.accessToken}`;

          const retryResponse = await fetch(url, {
            method,
            headers,
            body: options.body,
          });

          // Capturar response headers del retry
          const retryResponseHeaders: Record<string, string> = {};
          retryResponse.headers.forEach((value, key) => {
            retryResponseHeaders[key] = value;
          });

          let responseBody: unknown = null;
          try {
            const text = await retryResponse.text();
            try {
              responseBody = JSON.parse(text);
            } catch {
              responseBody = text;
            }
          } catch {
            responseBody = null;
          }

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ message: `Request failed: ${retryResponse.statusText}` }));
            const errorData: RequestResponseData = {
              ...requestData,
              responseStatus: retryResponse.status,
              responseHeaders: retryResponseHeaders,
              responseBody: error,
              error: error.message || `Request failed: ${retryResponse.statusText}`,
            };
            if (this.requestResponseCallback) {
              this.requestResponseCallback(errorData);
            }
            throw new Error(error.message || `Request failed: ${retryResponse.statusText}`);
          }

          const finalData: RequestResponseData = {
            ...requestData,
            responseStatus: retryResponse.status,
            responseHeaders: retryResponseHeaders,
            responseBody,
          };
          if (this.requestResponseCallback) {
            this.requestResponseCallback(finalData);
          }

          return responseBody;
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

      let responseBody: unknown = null;
      try {
        const text = await response.text();
        try {
          responseBody = JSON.parse(text);
        } catch {
          responseBody = text;
        }
      } catch {
        responseBody = null;
      }

      if (!response.ok) {
        const errorData: RequestResponseData = {
          ...requestData,
          responseStatus: response.status,
          responseHeaders,
          responseBody,
          error: typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
            ? String(responseBody.message)
            : `Request failed: ${response.statusText}`,
        };
        if (this.requestResponseCallback) {
          this.requestResponseCallback(errorData);
        }
        throw new Error(
          typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
            ? String(responseBody.message)
            : `Request failed: ${response.statusText}`
        );
      }

      const finalData: RequestResponseData = {
        ...requestData,
        responseStatus: response.status,
        responseHeaders,
        responseBody,
      };
      if (this.requestResponseCallback) {
        this.requestResponseCallback(finalData);
      }

      return responseBody;
    } catch (error) {
      const errorData: RequestResponseData = {
        ...requestData,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      if (this.requestResponseCallback) {
        this.requestResponseCallback(errorData);
      }
      throw error;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

