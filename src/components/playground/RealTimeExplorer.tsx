"use client";

import { useState, useEffect } from "react";
import { ArkaCDNClient, FileInfo, RequestResponseData } from "@/lib/arka-cdn-client";
import { assembleFileUrl } from "@/utils/url";
import {
  ExternalLink,
  File,
  Image,
  Video,
  FileText,
  Archive,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { useFiles, useFile } from "@/hooks/useFiles";
import { RequestResponseViewer } from "@/components/common/RequestResponseViewer";

const PreviewModal = ({
  file,
  isOpen,
  onClose,
}: {
  file: FileInfo | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const fileUrl = assembleFileUrl(file.id);
  const isImage = file.mimeType.startsWith("image/");
  const isVideo = file.mimeType.startsWith("video/");
  const isText =
    file.mimeType.includes("json") || file.mimeType.includes("text");

  const handleOpenInNewTab = () => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-purple-950/50 border border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-700/30">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base sm:text-xl font-semibold text-white truncate">
              {file.originalName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-purple-300/70">
              <span>Peso: {formatFileSize(file.size)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="break-all">Formato: {file.mimeType}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-400/60 hover:text-purple-300 transition-colors p-1.5 sm:p-2 flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt={file.originalName}
                className="shadow-xl max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg"
              />
            ) : isVideo ? (
              <video
                src={fileUrl}
                controls
                className="shadow-xl max-w-full max-h-[50vh] sm:max-h-[60vh] rounded-lg"
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            ) : isText ? (
              <iframe
                src={fileUrl}
                className="shadow-xl w-full h-[50vh] sm:h-[60vh] border border-purple-700/30 rounded-lg bg-white"
                title={file.originalName}
              />
            ) : (
              <div className="shadow-xl text-center py-8 sm:py-12">
                <File className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400/50 mx-auto mb-3 sm:mb-4" />
                <p className="text-purple-300/70 text-sm sm:text-base px-4">
                  Previsualización no disponible para este tipo de archivo
                </p>
                <p className="text-purple-400/50 text-xs sm:text-sm mt-2">
                  {file.mimeType}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-purple-700/30">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 sm:px-6 py-2 sm:py-2.5 text-purple-300 bg-purple-800/50 border border-purple-700/50 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-800/70 hover:border-purple-600/70 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="cursor-pointer px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Abrir en una pestaña nueva</span>
            <span className="sm:hidden">Abrir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FileCard = ({
  file,
  client,
  isAuthenticated,
  isExpanded,
  onToggleDetails,
  onPreview,
}: {
  file: FileInfo;
  client: ArkaCDNClient;
  isAuthenticated: boolean;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onPreview: () => void;
}) => {
  const { file: fileDetails, isLoading: isLoadingDetails } = useFile(
    client,
    isExpanded ? file.id : null,
    isAuthenticated
  );

  const isPending =
    file.chunks?.some(
      (chunk) =>
        chunk.uploadStatus === "pending" || chunk.uploadStatus === "uploading"
    ) || false;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="w-5 h-5" />;
    }
    if (mimeType.startsWith("video/")) {
      return <Video className="w-5 h-5" />;
    }
    if (mimeType.includes("json") || mimeType.includes("text")) {
      return <FileText className="w-5 h-5" />;
    }
    if (
      mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      mimeType.includes("gz")
    ) {
      return <Archive className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="rounded-lg p-4 sm:p-6 lg:p-8 bg-purple-900/10 border border-purple-600/30 hover:bg-purple-900/20 transition-colors">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 text-purple-400 mt-0.5">
            {getFileIcon(file.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-xs sm:text-sm mb-1.5 truncate">
              {file.originalName}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-purple-400/70">
              <span className="break-all">{file.mimeType}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatFileSize(file.size)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden md:inline">{formatDate(file.createdAt)}</span>
            </div>
            <button
              onClick={onPreview}
              className="cursor-pointer text-xs text-purple-400 hover:text-purple-300 mt-1.5 inline-block transition-colors"
            >
              Click to preview
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={onToggleDetails}
            className="cursor-pointer text-purple-400/60 hover:text-purple-300 transition-colors p-1"
            title="Ver detalles"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <a
            href={assembleFileUrl(file.id)}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-purple-400/60 hover:text-purple-300 transition-colors p-1 ${
              isPending ? "opacity-40 cursor-wait pointer-events-none" : ""
            }`}
            onClick={(e) => {
              if (isPending) {
                e.preventDefault();
              }
            }}
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-700/20 space-y-2 sm:space-y-3">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          ) : fileDetails?.chunks ? (
            <>
              <p className="text-xs sm:text-sm text-purple-300/70 font-medium mb-2">
                Transacciones ({fileDetails.chunks.length} chunks)
              </p>
              {fileDetails.chunks.map((chunk, idx) => {
                const isChunkPending =
                  chunk.uploadStatus === "pending" ||
                  chunk.uploadStatus === "uploading";
                return (
                  <div
                    key={chunk.id || idx}
                    className={`bg-purple-950/20 rounded p-3 sm:p-4 space-y-1.5 text-xs sm:text-sm ${
                      isChunkPending ? "border-yellow-700/30" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-purple-300/70">
                        Chunk #{chunk.chunkIndex}
                      </span>
                      <span
                        className={`capitalize flex items-center gap-1 ${
                          isChunkPending
                            ? "text-yellow-400/80"
                            : chunk.uploadStatus === "completed"
                            ? "text-green-400/80"
                            : "text-red-400/80"
                        }`}
                      >
                        {isChunkPending && (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        )}
                        {chunk.uploadStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-purple-300/60 mb-0.5 text-xs">Arkiv</p>
                      <p className="text-purple-400/70 font-mono break-all leading-tight text-xs sm:text-sm">
                        {chunk.arkivAddress}
                      </p>
                    </div>
                    {chunk.txHash && (
                      <div>
                        <p className="text-purple-300/60 mb-0.5 text-xs">TX Hash</p>
                        <p className="text-purple-400/70 font-mono break-all leading-tight text-xs sm:text-sm">
                          {chunk.txHash}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-purple-800/20">
                      <span className="text-purple-300/60 text-xs">Tamaño</span>
                      <span className="text-white/80 text-xs sm:text-sm">
                        {formatFileSize(chunk.size)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const RealTimeExplorer = () => {
  const [latestRequestResponse, setLatestRequestResponse] = useState<RequestResponseData | null>(null);
  const [client] = useState(() => {
    const c = new ArkaCDNClient(undefined, "test", (data) => {
      setLatestRequestResponse(data);
    });
    return c;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);

  const { files, isLoading, error } = useFiles(client, isAuthenticated);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const email = process.env.NEXT_PUBLIC_TEST_EMAIL;
        const password = process.env.NEXT_PUBLIC_TEST_PASSWORD;
        const username = process.env.NEXT_PUBLIC_TEST_USERNAME;

        if (!email || !password || !username) {
          console.error('Las credenciales de test no están configuradas.');
          return;
        }

        try {
          await client.login(email, password);
        } catch {
          await client.register(email, password, username);
          await client.login(email, password);
        }
        setIsAuthenticated(true);
      } catch {
      }
    };

    authenticate();
  }, [client]);

  const toggleFileDetails = (fileId: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  if (isLoading && files.length === 0) {
    return (
      <section id="explorer" className="py-8 sm:py-14 pb-12 sm:pb-20 lg:py-20 lg:pb-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-purple-900/10 p-6 sm:p-8 lg:p-12 rounded-2xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-xs mb-4">
              <span className="text-purple-400">Paso 2</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 px-4">
              Explora tus archivos
            </h2>
            <p className="text-base sm:text-lg text-slate-400 px-4">
              Explora tus archivos subidos y observa cómo Arka CDN los
              distribuye globalmente en segundos
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                  Uploaded files
                </h2>
                <p className="text-xs sm:text-sm text-purple-400/70 break-all">
                  Account: {process.env.NEXT_PUBLIC_TEST_EMAIL || 'test@cloudycoding.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center py-12 sm:py-20">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="explorer"
      className="py-8 sm:py-14 pb-12 sm:pb-20 lg:py-20 lg:pb-28 scroll-mt-20 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto bg-purple-900/10 p-6 sm:p-8 lg:p-12 rounded-2xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-xs mb-4">
            <span className="text-purple-400">Paso 2</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 px-4">
            Explora tus archivos
          </h2>
          <p className="text-base sm:text-lg text-slate-400 px-4">
            Explora tus archivos subidos y observa cómo Arka CDN los distribuye
            globalmente en segundos
          </p>
        </div>
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Uploaded files
              </h2>
              <p className="text-xs sm:text-sm text-purple-400/70 break-all">
                Account: test@cloudycoding.com
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-purple-400/60 hover:text-purple-300 transition-colors p-2 rounded-lg hover:bg-purple-900/20 flex-shrink-0"
              title="Actualizar"
            >
              <RefreshCw className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-red-300 text-xs sm:text-sm">
              {error instanceof Error
                ? error.message
                : "Error al cargar archivos"}
            </p>
          </div>
        )}

        {files.length === 0 ? (
          <div className="border border-purple-700/20 rounded-lg p-8 sm:p-12 text-center bg-purple-900/5">
            <File className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400/50 mx-auto mb-3" />
            <p className="text-purple-300/70 text-sm">Aún no hay archivos</p>
            <p className="text-purple-400/50 text-xs mt-1">
              Sube algo arriba para empezar
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {files.map((file) => {
              return (
                <FileCard
                  key={file.id}
                  file={file}
                  client={client}
                  isAuthenticated={isAuthenticated}
                  isExpanded={expandedFiles.has(file.id)}
                  onToggleDetails={() => toggleFileDetails(file.id)}
                  onPreview={() => setPreviewFile(file)}
                />
              );
            })}
          </div>
        )}

        <PreviewModal
          file={previewFile}
          isOpen={previewFile !== null}
          onClose={() => setPreviewFile(null)}
        />

        {latestRequestResponse && (
          <div className="mt-6">
            <RequestResponseViewer 
              data={latestRequestResponse}
              onClose={() => setLatestRequestResponse(null)}
            />
          </div>
        )}
      </div>
    </section>
  );
};
