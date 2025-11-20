'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArkaCDNClient, FileInfo, UploadResponse, RequestResponseData } from '@/lib/arka-cdn-client';
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
  BarChart3,
  Activity,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { RequestResponseViewer } from '@/components/common/RequestResponseViewer';
import { useI18n } from '@/i18n/I18nProvider';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const PersonalFilesManager = () => {
  const { t } = useI18n();
  const [latestRequestResponse, setLatestRequestResponse] = useState<RequestResponseData | null>(null);
  const [personalClient] = useState(() => {
    const c = new ArkaCDNClient(undefined, 'user', (data) => {
      setLatestRequestResponse(data);
    });
    return c;
  });
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
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [plainTextData, setPlainTextData] = useState('');
  const [plainTextFilename, setPlainTextFilename] = useState('data.txt');
  const [isPlainTextJson, setIsPlainTextJson] = useState(false);
  const [viewingFileContent, setViewingFileContent] = useState<{ id: string; type: 'text' | 'json' } | null>(null);
  const [fileContent, setFileContent] = useState<string | object | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ fileId: string; status: {
    status: string;
    progress: number;
    totalChunks: number;
    uploadedChunks: number;
    failedChunks: number;
    retryCount: number;
    chunks?: Array<{ chunkIndex: number; status: string; arkivAddress?: string }>;
  } } | null>(null);
  const [poolStats, setPoolStats] = useState<{
    queues: Array<{
      queueIndex: number;
      walletAddress: string;
      pendingChunks: number;
      isProcessing: boolean;
      successCount: number;
      failedCount?: number;
      errorCount?: number;
    }>;
    totalWallets: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (personalClient.isAuthenticated()) {
        setIsAuthenticated(true);
        try {
          const profile = await personalClient.getProfile();
          const { id, email, name } =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (profile && (profile as any).data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? (profile as any).data
              : profile) as { id: string; email: string; name?: string };
          setUserProfile({ id, email, name });
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
      setError(err.message || t('playground.personalFiles.errors.loadError'));
    } finally {
      setLoading(false);
    }
  }, [personalClient, isAuthenticated, t]);

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
    window.location.replace("/")
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(t('playground.personalFiles.errors.fileTooLarge'));
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
      setError(err.message || t('playground.personalFiles.errors.uploadError'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm(t('playground.personalFiles.myFiles.deleteConfirm'))) return;

    setDeletingFileId(fileId);
    try {
      await personalClient.deleteFile(fileId);
      await loadPersonalFiles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.personalFiles.errors.deleteError'));
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUploadPlainText = async () => {
    if (!plainTextData.trim() || !plainTextFilename.trim()) {
      setError(t('playground.personalFiles.errors.required'));
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let dataToUpload: string | object = plainTextData;
      if (isPlainTextJson) {
        try {
          dataToUpload = JSON.parse(plainTextData);
        } catch {
          throw new Error(t('playground.personalFiles.errors.invalidJson'));
        }
      }

      const result = await personalClient.uploadPlainText(
        dataToUpload,
        plainTextFilename,
        `Uploaded from personal account: ${plainTextFilename}`
      );

      setUploadResult(result);
      setPlainTextData('');
      setPlainTextFilename('data.txt');
      setIsPlainTextJson(false);
      await loadPersonalFiles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.personalFiles.errors.textError'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleViewFileContent = async (fileId: string, type: 'text' | 'json') => {
    setLoadingContent(true);
    setViewingFileContent({ id: fileId, type });
    setFileContent(null);
    setError(null);

    try {
      if (type === 'text') {
        const response = await personalClient.getFileAsText(fileId);
        setFileContent(response.data.content);
      } else {
        const response = await personalClient.getFileAsJson(fileId);
        setFileContent(response.data.data as object);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.personalFiles.errors.contentError'));
      setViewingFileContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleViewUploadStatus = async (fileId: string) => {
    try {
      const status = await personalClient.getUploadStatus(fileId);
      setUploadStatus({ fileId, status: status.data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.personalFiles.errors.statusError'));
    }
  };

  const loadPoolStats = async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const stats = await personalClient.getWalletPoolStats();
      if (stats.data && stats.data.queues && Array.isArray(stats.data.queues)) {
        setPoolStats(stats.data);
      } else {
        throw new Error(t('playground.personalFiles.errors.statsFormatError'));
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.personalFiles.errors.statsError'));
      setPoolStats(null);
    } finally {
      setLoadingStats(false);
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
    const language = t('playground.personalFiles.myFiles.uploaded') === 'Subido' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(language, {
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
              <span className="text-purple-400">{t('playground.personalFiles.badge')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-4">
              {t('playground.personalFiles.title')}
            </h2>
            <p className="text-lg text-slate-400">
              {t('playground.personalFiles.description')}
            </p>
          </div>

          <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 text-center shadow-2xl shadow-purple-900/20">
            <User className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-purple-300 text-lg mb-4">{t('playground.personalFiles.notLoggedIn')}</p>
            <p className="text-slate-400 text-sm mb-6">
              {t('playground.personalFiles.notLoggedInDesc')}
            </p>
            <a
              href="/login?redirect=/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40"
            >
              <User className="w-5 h-5" />
              {t('playground.personalFiles.login')}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="personal-files" className="mb-8 scroll-mt-20">
      <div className="max-w-7xl mx-auto">

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 mb-8 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center border border-purple-700/30">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">{userProfile?.name || t('playground.personalFiles.user')}</p>
                <p className="text-purple-300 text-sm">{userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTokens(!showTokens)}
                className="cursor-pointer px-4 py-2 bg-purple-900/30 text-white rounded-lg text-sm font-medium hover:bg-purple-900/50 transition-all flex items-center gap-2 border border-purple-700/30"
              >
                {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTokens ? t('playground.personalFiles.hideKeys') : t('playground.personalFiles.showKeys')} {t('playground.personalFiles.keys')}
              </button>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-900/50 transition-all flex items-center gap-2 border border-red-700/50"
              >
                <LogOut className="w-4 h-4" />
                {t('playground.personalFiles.logout')}
              </button>
            </div>
          </div>

          {showTokens && (
            <div className="mt-6 pt-6 border-t border-purple-700/30 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-purple-400" />
                <p className="text-white font-medium">{t('playground.personalFiles.accessKeys')}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-purple-300 mb-2">{t('playground.personalFiles.accessToken')}</p>
                  <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-purple-400 text-xs break-all font-mono">
                      {tokens.accessToken || t('playground.personalFiles.notAvailable')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-purple-300 mb-2">{t('playground.personalFiles.refreshToken')}</p>
                  <div className="bg-purple-950/50 rounded-lg p-3 border border-purple-800/30">
                    <p className="text-purple-400 text-xs break-all font-mono">
                      {tokens.refreshToken || t('playground.personalFiles.notAvailable')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 mb-8 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" />
              {t('playground.personalFiles.upload.title')}
            </h3>
            <button
              onClick={loadPoolStats}
              disabled={loadingStats}
              className="cursor-pointer px-4 py-2 bg-purple-900/30 text-white rounded-lg text-sm font-medium hover:bg-purple-900/50 transition-all flex items-center gap-2 disabled:opacity-50 border border-purple-700/30"
            >
              <BarChart3 className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
              {t('playground.personalFiles.upload.stats')}
            </button>
          </div>

          <div className="flex gap-2 mb-6 border-b border-purple-700/30">
            <button
              onClick={() => {
                setUploadMode('file');
                setError(null);
                setUploadResult(null);
              }}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                uploadMode === 'file'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-purple-300/60 hover:text-purple-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                {t('playground.personalFiles.upload.uploadFile')}
              </div>
            </button>
            <button
              onClick={() => {
                setUploadMode('text');
                setError(null);
                setUploadResult(null);
              }}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                uploadMode === 'text'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-purple-300/60 hover:text-purple-300'
              }`}
            >
              <div className="cursor-pointer flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('playground.personalFiles.upload.textJson')}
              </div>
            </button>
          </div>

          {!uploadResult ? (
            <>
              {uploadMode === 'file' ? (
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
                    setError(t('playground.personalFiles.errors.fileTooLarge'));
                  }
                }}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium">{t('playground.personalFiles.upload.uploading')}</p>
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
                      <span className="text-lg font-medium">{t('playground.personalFiles.upload.fileSelected')}</span>
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
                        {t('playground.personalFiles.upload.uploadFile')}
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
                        {t('playground.personalFiles.upload.cancel')}
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
                        {t('playground.personalFiles.upload.dragDrop')}
                      </p>
                      <p className="text-slate-400 text-sm mb-4">{t('playground.personalFiles.upload.or')}</p>
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
                          {t('playground.personalFiles.upload.selectFile')}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-purple-400 mt-4">
                      {t('playground.personalFiles.upload.maxSize')}
                    </p>
                  </div>
                )}
              </div>

              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      {t('playground.personalFiles.upload.fileName')}
                    </label>
                    <input
                      type="text"
                      value={plainTextFilename}
                      onChange={(e) => setPlainTextFilename(e.target.value)}
                      placeholder={t('playground.personalFiles.upload.fileNamePlaceholder')}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-purple-300">
                        {t('playground.personalFiles.upload.content')}
                      </label>
                      <label className="flex items-center gap-2 text-xs text-purple-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPlainTextJson}
                          onChange={(e) => setIsPlainTextJson(e.target.checked)}
                          className="rounded"
                          disabled={isUploading}
                        />
                        {t('playground.personalFiles.upload.isJson')}
                      </label>
                    </div>
                    <textarea
                      value={plainTextData}
                      onChange={(e) => setPlainTextData(e.target.value)}
                      placeholder={isPlainTextJson ? t('playground.personalFiles.upload.jsonPlaceholder') : t('playground.personalFiles.upload.textPlaceholder')}
                      rows={10}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500 font-mono text-sm"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUploadPlainText}
                      disabled={isUploading || !plainTextData.trim()}
                      className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-700/30"
                    >
                      <UploadCloud className="w-5 h-5" />
                      {isUploading ? t('playground.personalFiles.upload.uploadingText') : t('playground.personalFiles.upload.uploadText')}
                    </button>
                    <button
                      onClick={() => {
                        setPlainTextData('');
                        setPlainTextFilename('data.txt');
                        setIsPlainTextJson(false);
                      }}
                      className="cursor-pointer px-6 py-3 bg-gray-700/50 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
                      disabled={isUploading}
                    >
                      {t('playground.personalFiles.upload.clear')}
                    </button>
                  </div>
                </div>
              )}

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
                  {t('playground.personalFiles.upload.success.title')}
                </h3>
              </div>

              <div className="bg-purple-900/20 rounded-xl p-6 space-y-4 border border-purple-700/30">
                <div>
                  <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.upload.success.publicUrl')}</p>
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
                  {t('playground.personalFiles.upload.success.viewInExplorer')}
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
                  {t('playground.personalFiles.upload.success.uploadAnother')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-8 lg:p-12 shadow-2xl shadow-purple-900/20">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <File className="w-5 h-5 text-purple-400" />
              {t('playground.personalFiles.myFiles.title')} ({files.length})
            </h3>
            <button
              onClick={loadPersonalFiles}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-purple-900/30 text-white rounded-lg text-sm font-medium hover:bg-purple-900/50 transition-all flex items-center gap-2 disabled:opacity-50 border border-purple-700/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('playground.personalFiles.myFiles.refresh')}
            </button>
          </div>

          {loading && files.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-300 text-lg">{t('playground.personalFiles.myFiles.noFiles')}</p>
              <p className="text-slate-400 text-sm mt-2">
                {t('playground.personalFiles.myFiles.noFilesDesc')}
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
                        <span className="text-purple-300">{t('playground.personalFiles.myFiles.size')}</span>
                        <span className="text-white font-medium">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-purple-300">{t('playground.personalFiles.myFiles.uploaded')}</span>
                        <span className="text-white font-medium">
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-700/30">
                      <p className="text-xs text-purple-300 mb-2">{t('playground.personalFiles.myFiles.publicUrl')}</p>
                      <div className="bg-purple-950/50 rounded-lg p-2 mb-3 border border-purple-800/30">
                        <p className="text-purple-400 text-xs break-all line-clamp-2">
                          {assembleFileUrl(file.id)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-700/30">
                      <a
                        href={assembleFileUrl(file.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[80px] px-3 py-2 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-700/20"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t('playground.personalFiles.myFiles.view')}
                      </a>
                      {(file.mimeType.includes('text') || file.mimeType.includes('json')) && (
                        <>
                          <button
                            onClick={() => handleViewFileContent(file.id, 'text')}
                            className="cursor-pointer px-3 py-2 bg-blue-900/30 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 border border-blue-700/50"
                            title={t('playground.personalFiles.myFiles.viewAsText')}
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          {file.mimeType.includes('json') && (
                            <button
                              onClick={() => handleViewFileContent(file.id, 'json')}
                              className="cursor-pointer px-3 py-2 bg-green-900/30 text-green-300 rounded-lg text-xs font-medium hover:bg-green-900/50 transition-all flex items-center justify-center gap-2 border border-green-700/50"
                              title={t('playground.personalFiles.myFiles.viewAsJson')}
                            >
                              <Database className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleViewUploadStatus(file.id)}
                        className="cursor-pointer px-3 py-2 bg-yellow-900/30 text-yellow-300 rounded-lg text-xs font-medium hover:bg-yellow-900/50 transition-all flex items-center justify-center gap-2 border border-yellow-700/50"
                        title={t('playground.personalFiles.myFiles.viewUploadStatus')}
                      >
                        <Activity className="w-3 h-3" />
                      </button>
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
                        {t('playground.personalFiles.myFiles.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {viewingFileContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewingFileContent(null)}>
            <div className="bg-purple-950/50 border border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-purple-700/30">
                <h3 className="text-xl font-semibold text-white">
                  {viewingFileContent.type === 'text' ? t('playground.personalFiles.viewContent.textTitle') : t('playground.personalFiles.viewContent.jsonTitle')}
                </h3>
                <button onClick={() => setViewingFileContent(null)} className="cursor-pointer text-purple-400/60 hover:text-purple-300 transition-colors p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingContent ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : fileContent !== null ? (
                  <pre className="bg-purple-950/30 rounded-lg p-4 text-sm text-purple-200 font-mono overflow-x-auto">
                    {viewingFileContent.type === 'json' ? JSON.stringify(fileContent, null, 2) : String(fileContent)}
                  </pre>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setUploadStatus(null)}>
            <div className="bg-purple-950/50 border border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-purple-700/30">
                <h3 className="text-xl font-semibold text-white">{t('playground.personalFiles.uploadStatus.title')}</h3>
                <button onClick={() => setUploadStatus(null)} className="cursor-pointer text-purple-400/60 hover:text-purple-300 transition-colors p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.status')}</p>
                    <p className="text-white font-medium capitalize">{uploadStatus.status.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.progress')}</p>
                    <div className="w-full bg-purple-900/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all"
                        style={{ width: `${uploadStatus.status.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-purple-400 mt-1">{uploadStatus.status.progress}%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.totalChunks')}</p>
                      <p className="text-white font-medium">{uploadStatus.status.totalChunks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.uploadedChunks')}</p>
                      <p className="text-white font-medium">{uploadStatus.status.uploadedChunks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.failedChunks')}</p>
                      <p className="text-white font-medium">{uploadStatus.status.failedChunks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-300 mb-1">{t('playground.personalFiles.uploadStatus.retries')}</p>
                      <p className="text-white font-medium">{uploadStatus.status.retryCount}</p>
                    </div>
                  </div>
                  {uploadStatus.status.chunks && uploadStatus.status.chunks.length > 0 && (
                    <div>
                      <p className="text-sm text-purple-300 mb-2">{t('playground.personalFiles.uploadStatus.chunkDetails')}</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {uploadStatus.status.chunks?.map((chunk, idx: number) => (
                          <div key={idx} className="bg-purple-950/30 rounded-lg p-3 text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-purple-300">{t('playground.personalFiles.uploadStatus.chunk')}{chunk.chunkIndex}</span>
                              <span className={`capitalize ${chunk.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {chunk.status}
                              </span>
                            </div>
                            {chunk.arkivAddress && (
                              <p className="text-purple-400 text-xs font-mono break-all">{chunk.arkivAddress}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {poolStats && poolStats.queues && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPoolStats(null)}>
            <div className="bg-purple-950/50 border border-purple-600/50 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-purple-700/30">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  {t('playground.personalFiles.poolStats.title')}
                </h3>
                <button onClick={() => setPoolStats(null)} className="cursor-pointer text-purple-400/60 hover:text-purple-300 transition-colors p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                    <p className="text-sm text-purple-300 mb-2">{t('playground.personalFiles.poolStats.summary')}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-purple-400 mb-1">{t('playground.personalFiles.poolStats.totalWallets')}</p>
                        <p className="text-2xl font-bold text-white">{poolStats.totalWallets ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 mb-1">{t('playground.personalFiles.poolStats.activeWallets')}</p>
                        <p className="text-2xl font-bold text-green-400">
                          {poolStats.queues.filter(q => q.isProcessing).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 mb-1">{t('playground.personalFiles.poolStats.pendingChunks')}</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {poolStats.queues.reduce((sum, q) => sum + (q.pendingChunks || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-purple-300 mb-3">{t('playground.personalFiles.poolStats.queueDetails')}</p>
                    <div className="space-y-3">
                      {poolStats.queues.map((queue) => {
                        const totalOperations = (queue.successCount || 0) + (queue.failedCount || 0) + (queue.errorCount || 0);
                        const successRate = totalOperations > 0 
                          ? ((queue.successCount || 0) / totalOperations * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <div
                            key={queue.queueIndex}
                            className={`bg-purple-900/10 border rounded-xl p-4 ${
                              queue.isProcessing 
                                ? 'border-green-700/50 bg-green-900/10' 
                                : 'border-purple-700/30'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-white font-medium">{t('playground.personalFiles.poolStats.queue')}{queue.queueIndex}</p>
                                  {queue.isProcessing && (
                                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded border border-green-700/50">
                                      {t('playground.personalFiles.poolStats.processing')}
                                    </span>
                                  )}
                                  {!queue.isProcessing && (
                                    <span className="px-2 py-0.5 bg-gray-900/30 text-gray-400 text-xs rounded border border-gray-700/50">
                                      {t('playground.personalFiles.poolStats.inactive')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-purple-400 text-xs font-mono break-all mb-3">
                                  {queue.walletAddress}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-purple-700/30">
                              <div>
                                <p className="text-xs text-purple-400 mb-1">{t('playground.personalFiles.poolStats.pending')}</p>
                                <p className="text-lg font-bold text-white">{queue.pendingChunks ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-green-400 mb-1">{t('playground.personalFiles.poolStats.successful')}</p>
                                <p className="text-lg font-bold text-green-400">{queue.successCount ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-red-400 mb-1">{t('playground.personalFiles.poolStats.failed')}</p>
                                <p className="text-lg font-bold text-red-400">{queue.failedCount ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-yellow-400 mb-1">{t('playground.personalFiles.poolStats.successRate')}</p>
                                <p className="text-lg font-bold text-yellow-400">{successRate}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                    <p className="text-sm text-purple-300 mb-3">{t('playground.personalFiles.poolStats.totalStats')}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-green-400 mb-1">{t('playground.personalFiles.poolStats.totalSuccessful')}</p>
                        <p className="text-xl font-bold text-green-400">
                          {poolStats.queues.reduce((sum, q) => sum + (q.successCount || 0), 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 mb-1">{t('playground.personalFiles.poolStats.totalFailed')}</p>
                        <p className="text-xl font-bold text-red-400">
                          {poolStats.queues.reduce((sum, q) => sum + (q.failedCount || 0), 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 mb-1">{t('playground.personalFiles.poolStats.globalSuccessRate')}</p>
                        <p className="text-xl font-bold text-white">
                          {(() => {
                            const totalSuccess = poolStats.queues.reduce((sum, q) => sum + (q.successCount || 0), 0);
                            const totalFailed = poolStats.queues.reduce((sum, q) => sum + (q.failedCount || 0), 0);
                            const total = totalSuccess + totalFailed;
                            return total > 0 ? ((totalSuccess / total) * 100).toFixed(1) : '0';
                          })()}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

