'use client';

import { useState, useRef, useCallback } from 'react';
import { ArkaCDNClient, UploadResponse } from '@/lib/arka-cdn-client';
import { assembleFileUrl } from '@/utils/url';
import { Upload, CheckCircle2, ExternalLink, UploadCloud, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const TryItNow = () => {
  const [client] = useState(() => new ArkaCDNClient(undefined, 'test'));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const ensureAuthenticated = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      try {
        await client.login('test@cloudycoding.com', 'test12345678');
      } catch {
        try {
          await client.register('test@cloudycoding.com', 'test12345678', 'Test User');
          await client.login('test@cloudycoding.com', 'test12345678');
        } catch {
          throw new Error('No se pudo autenticar. Por favor, intente más tarde.');
        }
      }
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [client]);

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
    if (!selectedFile) return;

    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const fileName = selectedFile.name;
      const result = await client.uploadFile(
        selectedFile,
        {
          compress: true,
          description: `Uploaded from playground: ${fileName}`,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploadResult(result);
      setUploadedFileName(fileName);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadAnother = () => {
    setUploadResult(null);
    setSelectedFile(null);
    setUploadedFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <section id="try-it" className="py-14 pb-20 lg:py-20 lg:pb-28 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-xs mb-4">
            <span className="text-purple-400">Paso 1</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-4">
            Prueba ahora
          </h2>
          <p className="text-lg text-slate-400">
            Sube un archivo de hasta 50MB y observa cómo Arka CDN lo distribuye globalmente en segundos
          </p>
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 shadow-2xl shadow-purple-900/20">
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
                    <div className="bg-purple-900/20 rounded-lg p-4 text-left">
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-purple-300 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleUpload}
                        disabled={isAuthenticating}
                        className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-700/30"
                      >
                        <UploadCloud className="w-5 h-5" />
                        {isAuthenticating ? 'Autenticando...' : 'Subir archivo'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
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
                          accept="image/jpeg,image/jpg,image/png,image/gif,
                            video/mp4,video/x-msvideo,video/quicktime,video/x-ms-wmv,video/webm,video/x-matroska,
                            application/json,text/plain,application/xml,text/xml,application/pdf,application/zip,
                            application/x-yaml,application/x-tar,application/gzip,application/javascript,text/javascript,
                            application/typescript,text/x-typescript,text/css,text/html,text/markdown,text/csv"
                          disabled={isUploading || isAuthenticating}
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
                <h3 className="text-2xl font-bold text-white mb-2">
                  File uploaded successfully!
                </h3>
              </div>

              <div className="bg-purple-900/20 rounded-xl p-6 space-y-4 border border-purple-700/30">
                <div>
                  <p className="text-sm text-purple-300 mb-1">Nombre del archivo</p>
                  <p className="text-white font-medium break-all">
                    {uploadedFileName || uploadResult.data.fileId}
                  </p>
                </div>

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
                  {uploadResult.data.status === 'pending' && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      El archivo se está subiendo, el enlace estará disponible pronto
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-700/30">
                  <div>
                    <p className="text-xs text-purple-300 mb-1">Tamaño original</p>
                    <p className="text-white font-medium">
                      {formatFileSize(uploadResult.data.originalSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">Tamaño final</p>
                    <p className="text-white font-medium">
                      {formatFileSize(uploadResult.data.totalSize)}
                      {uploadResult.data.compressed && (
                        <span className="text-green-400 text-xs ml-2">
                          (comprimido)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">Chunks</p>
                    <p className="text-white font-medium">
                      {uploadResult.data.chunks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">Estado</p>
                    <p className="text-white font-medium capitalize">
                      {uploadResult.data.status}
                    </p>
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
                  onClick={handleUploadAnother}
                  className="px-6 py-3 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-700 transition-all hover:scale-105 transform"
                >
                  Upload another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

