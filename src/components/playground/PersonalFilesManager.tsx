'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArkaCDNClient, FileInfo, UploadResponse } from '@/lib/arka-cdn-client';
import { assembleFileUrl } from '@/utils/url';
import {
  User,
  LogOut,
  Key,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  ExternalLink,
  File,
  Image,
  Video,
  FileText,
  Archive,
  Loader2,
  CheckCircle2,
  X,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const PersonalFilesManager = () => {
  const [personalClient] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [showTokens, setShowTokens] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (personalClient.isAuthenticated()) {
        setIsAuthenticated(true);
        try {
          const profile = await personalClient.getProfile();
          setUserProfile(profile.data || profile);
        } catch {
          await personalClient.logout();
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, [personalClient]);

  const loadPersonalFiles = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await personalClient.listFiles();
      setFiles(response.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  }, [personalClient, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPersonalFiles();
    }
  }, [isAuthenticated, loadPersonalFiles]);

  const getTokens = () => {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
    return {
      accessToken: localStorage.getItem('arka_user_access_token'),
      refreshToken: localStorage.getItem('arka_user_refresh_token'),
    };
  };

  const handleLogout = async () => {
    await personalClient.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setFiles([]);
    setShowTokens(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo es demasiado grande. Tamaño máximo: 50MB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !isAuthenticated) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await personalClient.uploadFile(
        selectedFile,
        {
          compress: true,
          description: `Uploaded from personal account: ${selectedFile.name}`,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadPersonalFiles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo?')) return;

    setDeletingFileId(fileId);
    try {
      await personalClient.deleteFile(fileId);
      await loadPersonalFiles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el archivo');
    } finally {
      setDeletingFileId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="w-5 h-5" />;
    }
    if (mimeType.startsWith('video/')) {
      return <Video className="w-5 h-5" />;
    }
    if (mimeType.includes('json') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5" />;
    }
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gz')) {
      return <Archive className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const tokens = getTokens();

  if (!isAuthenticated) {
    return (
      <section id="personal-files" className="py-14 pb-20 lg:py-20 lg:pb-28 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-xs mb-4">
              <span className="text-purple-400">Personal</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-4">
              Administra tus archivos
            </h2>
            <p className="text-lg text-slate-400">
              Inicia sesión con tu cuenta personal para gestionar tus archivos
            </p>
          </div>

          <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 text-center shadow-2xl shadow-purple-900/20">
            <User className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-purple-300 text-lg mb-4">No has iniciado sesión</p>
            <p className="text-slate-400 text-sm mb-6">
              Para administrar tus archivos personales, necesitas iniciar sesión con tu cuenta.
            </p>
            <a
              href="/login?redirect=/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40"
            >
              <User className="w-5 h-5" />
              Iniciar sesión
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="personal-files" className="pb-20 lg:pb-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto">

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 mb-8 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center border border-purple-700/30">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">{userProfile?.name || 'Usuario'}</p>
                <p className="text-purple-300 text-sm">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTokens(!showTokens)}
                className="cursor-pointer px-4 py-2 bg-purple-900/30 text-white rounded-lg text-sm font-medium hover:bg-purple-900/50 transition-all flex items-center gap-2 border border-purple-700/30"
              >
                {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTokens ? 'Ocultar' : 'Ver'} claves
              </button>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-900/50 transition-all flex items-center gap-2 border border-red-700/50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>

          {showTokens && (
            <div className="mt-6 pt-6 border-t border-purple-700/30 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-purple-400" />
                <p className="text-white font-medium">Claves de acceso</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-purple-300 mb-2">Access Token</p>
                  <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-purple-400 text-xs break-all font-mono">
                      {tokens.accessToken || 'No disponible'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-purple-300 mb-2">Refresh Token</p>
                  <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-purple-400 text-xs break-all font-mono">
                      {tokens.refreshToken || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 mb-8 shadow-2xl shadow-purple-900/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-purple-400" />
            Subir archivo personal
          </h3>

          {!uploadResult ? (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isUploading
                    ? 'border-purple-500 bg-purple-900/20 animate-pulse'
                    : selectedFile
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-purple-600/50 bg-purple-900/10 hover:border-purple-500 hover:bg-purple-900/20 cursor-pointer'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.size <= MAX_FILE_SIZE) {
                    setSelectedFile(file);
                    setError(null);
                    setUploadResult(null);
                  } else if (file) {
                    setError(`El archivo es demasiado grande. Tamaño máximo: 50MB`);
                  }
                }}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium">Subiendo archivo...</p>
                      <div className="w-full bg-purple-900/30 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-purple-300">{Math.round(uploadProgress)}%</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                      <span className="text-lg font-medium">Archivo seleccionado</span>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-4 text-left border border-purple-700/30">
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-purple-300 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleUpload}
                        className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-700/30"
                      >
                        <UploadCloud className="w-5 h-5" />
                        Subir archivo
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="cursor-pointer px-6 py-3 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-16 h-16 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-lg font-medium mb-2">
                        Arrastra y suelta un archivo aquí
                      </p>
                      <p className="text-slate-400 text-sm mb-4">o</p>
                      <label className="inline-block">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploading}
                          accept="image/jpeg,image/jpg,image/png,image/gif,
                            video/mp4,video/x-msvideo,video/quicktime,video/x-ms-wmv,video/webm,video/x-matroska,
                            application/json,text/plain,application/xml,text/xml,application/pdf,application/zip,
                            application/x-yaml,application/x-tar,application/gzip,application/javascript,text/javascript,
                            application/typescript,text/x-typescript,text/css,text/html,text/markdown,text/csv"
                        />
                        <span className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-purple-700/30">
                          Seleccionar archivo
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-purple-400 mt-4">
                      Tamaño máximo: 50MB
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Archivo subido exitosamente
                </h3>
              </div>

              <div className="bg-purple-900/20 rounded-xl p-6 space-y-4 border border-purple-700/30">
                <div>
                  <p className="text-sm text-purple-300 mb-1">URL pública</p>
                  <div className="flex items-center gap-2 bg-purple-950/50 rounded-lg p-3 border border-purple-800/30 group">
                    <p className="text-purple-400 text-sm break-all flex-1">
                      {assembleFileUrl(uploadResult.data.fileId)}
                    </p>
                    <a
                      href={assembleFileUrl(uploadResult.data.fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-all hover:scale-110 relative"
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href={assembleFileUrl(uploadResult.data.fileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all flex items-center gap-2 hover:scale-105 transform shadow-lg shadow-purple-700/30"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ver en explorador
                </Link>
                <button
                  onClick={() => {
                    setUploadResult(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="cursor-pointer px-6 py-3 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-700 transition-all hover:scale-105 transform"
                >
                  Subir otro archivo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <File className="w-5 h-5 text-purple-400" />
              Mis archivos ({files.length})
            </h3>
            <button
              onClick={loadPersonalFiles}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-purple-900/30 text-white rounded-lg text-sm font-medium hover:bg-purple-900/50 transition-all flex items-center gap-2 disabled:opacity-50 border border-purple-700/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loading && files.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300 text-lg">No hay archivos aún</p>
              <p className="text-slate-400 text-sm mt-2">
                Sube tu primer archivo usando el formulario de arriba
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-purple-900/10 border border-purple-700/30 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-900/20"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-400 flex-shrink-0 border border-purple-700/30">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {file.originalName}
                          </p>
                          <p className="text-purple-400 text-xs mt-0.5">
                            {file.mimeType}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-purple-700/30">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-purple-300">Tamaño</span>
                        <span className="text-white font-medium">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-purple-300">Subido</span>
                        <span className="text-white font-medium">
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-700/30">
                      <p className="text-xs text-purple-300 mb-2">URL pública</p>
                      <div className="bg-purple-950/50 rounded-lg p-2 mb-3 border border-purple-800/30">
                        <p className="text-purple-400 text-xs break-all line-clamp-2">
                          {assembleFileUrl(file.id)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-purple-700/30">
                      <a
                        href={assembleFileUrl(file.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-700/20"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingFileId === file.id}
                        className="cursor-pointer px-3 py-2 bg-red-900/30 text-red-300 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-red-700/50"
                      >
                        {deletingFileId === file.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

