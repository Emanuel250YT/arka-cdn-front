'use client';

import { useState, useRef, useCallback } from 'react';
import { ArkaCDNClient, UploadResponse, RequestResponseData } from '@/lib/arka-cdn-client';
import { assembleFileUrl } from '@/utils/url';
import { Upload, CheckCircle2, ExternalLink, UploadCloud, X, Loader2, FileText, File } from 'lucide-react';
import Link from 'next/link';
import { RequestResponseViewer } from '@/components/common/RequestResponseViewer';
import { useI18n } from '@/i18n/I18nProvider';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

type UploadMode = 'file' | 'text';

export const TryItNow = () => {
  const { t } = useI18n();
  const [latestRequestResponse, setLatestRequestResponse] = useState<RequestResponseData | null>(null);
  const [client] = useState(() => {
    const c = new ArkaCDNClient(undefined, 'test', (data) => {
      setLatestRequestResponse(data);
    });
    return c;
  });
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [plainTextData, setPlainTextData] = useState('');
  const [plainTextFilename, setPlainTextFilename] = useState('data.txt');
  const [isPlainTextJson, setIsPlainTextJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const ensureAuthenticated = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      const email = process.env.NEXT_PUBLIC_TEST_EMAIL;
      const password = process.env.NEXT_PUBLIC_TEST_PASSWORD;
      const username = process.env.NEXT_PUBLIC_TEST_USERNAME;

      if (!email || !password || !username) {
        throw new Error(t('playground.tryItNow.errors.testCredentials'));
      }

      try {
        await client.login(email, password);
      } catch {
          try {
            await client.register(email, password, username);
            await client.login(email, password);
          } catch {
            throw new Error(t('playground.tryItNow.errors.authError'));
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
      setError(t('playground.tryItNow.errors.fileTooLarge'));
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
      setError(err.message || t('playground.tryItNow.errors.uploadError'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadPlainText = async () => {
    if (!plainTextData.trim() || !plainTextFilename.trim()) {
      setError(t('playground.tryItNow.errors.required'));
      return;
    }

    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let dataToUpload: string | object = plainTextData;
      if (isPlainTextJson) {
        try {
          dataToUpload = JSON.parse(plainTextData);
        } catch {
          throw new Error(t('playground.tryItNow.errors.invalidJson'));
        }
      }

      const result = await client.uploadPlainText(
        dataToUpload,
        plainTextFilename,
        `Uploaded from playground: ${plainTextFilename}`
      );

      setUploadResult(result);
      setPlainTextData('');
      setPlainTextFilename('data.txt');
      setIsPlainTextJson(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t('playground.tryItNow.errors.textError'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadAnother = () => {
    setUploadResult(null);
    setSelectedFile(null);
    setUploadedFileName(null);
    setPlainTextData('');
    setPlainTextFilename('data.txt');
    setIsPlainTextJson(false);
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
    <section id="try-it" className="py-8 sm:py-14 pb-12 sm:pb-20 lg:py-20 lg:pb-28 scroll-mt-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-xs mb-4">
            <span className="text-purple-400">{t('playground.tryItNow.step')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 px-4">
            {t('playground.tryItNow.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-400 px-4">
            {t('playground.tryItNow.description')}
          </p>
        </div>

        <div className="backdrop-blur-sm rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-4 sm:p-6 lg:p-12 shadow-2xl shadow-purple-900/20">
          <div className="flex gap-2 mb-6 border-b border-purple-700/30 overflow-x-auto">
            <button
              onClick={() => {
                setUploadMode('file');
                setError(null);
                setUploadResult(null);
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                uploadMode === 'file'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-purple-300/60 hover:text-purple-300'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <File className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('playground.tryItNow.uploadFile')}</span>
                <span className="sm:hidden">{t('playground.tryItNow.file')}</span>
              </div>
            </button>
            <button
              onClick={() => {
                setUploadMode('text');
                setError(null);
                setUploadResult(null);
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                uploadMode === 'text'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-purple-300/60 hover:text-purple-300'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('playground.tryItNow.textJson')}</span>
                <span className="sm:hidden">{t('playground.tryItNow.text')}</span>
              </div>
            </button>
          </div>

          {!uploadResult ? (
            <>
              {uploadMode === 'file' ? (
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${
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
                    setError(t('playground.tryItNow.errors.fileTooLarge'));
                  }
                }}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-400"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium text-sm sm:text-base">{t('playground.tryItNow.uploading')}</p>
                      <div className="w-full bg-purple-900/30 rounded-full h-2.5 sm:h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-purple-300">{Math.round(uploadProgress)}%</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-green-400">
                      <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                      <span className="text-base sm:text-lg font-medium">{t('playground.tryItNow.fileSelected')}</span>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 text-left">
                      <p className="text-white font-medium text-sm sm:text-base break-all">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-purple-300 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleUpload}
                        disabled={isAuthenticating}
                        className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl text-sm sm:text-base font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-700/30"
                      >
                        <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5" />
                        {isAuthenticating ? t('playground.tryItNow.authenticating') : t('playground.tryItNow.uploadFile')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700/50 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-700 transition-all"
                      >
                        {t('playground.tryItNow.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-base sm:text-lg font-medium mb-2">
                        {t('playground.tryItNow.dragDrop')}
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm mb-4">{t('playground.tryItNow.or')}</p>
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
                        <span className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl text-sm sm:text-base font-medium hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-purple-700/30">
                          {t('playground.tryItNow.selectFile')}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-purple-400 mt-4">
                      {t('playground.tryItNow.maxSize')}
                    </p>
                  </div>
                )}
              </div>

              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      {t('playground.tryItNow.fileName')}
                    </label>
                    <input
                      type="text"
                      value={plainTextFilename}
                      onChange={(e) => setPlainTextFilename(e.target.value)}
                      placeholder={t('playground.tryItNow.fileNamePlaceholder')}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500"
                      disabled={isUploading || isAuthenticating}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-purple-300">
                        {t('playground.tryItNow.content')}
                      </label>
                      <label className="flex items-center gap-2 text-xs text-purple-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPlainTextJson}
                          onChange={(e) => setIsPlainTextJson(e.target.checked)}
                          className="rounded"
                          disabled={isUploading || isAuthenticating}
                        />
                        {t('playground.tryItNow.isJson')}
                      </label>
                    </div>
                    <textarea
                      value={plainTextData}
                      onChange={(e) => setPlainTextData(e.target.value)}
                      placeholder={isPlainTextJson ? t('playground.tryItNow.jsonPlaceholder') : t('playground.tryItNow.textPlaceholder')}
                      rows={10}
                      className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500 font-mono text-sm"
                      disabled={isUploading || isAuthenticating}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleUploadPlainText}
                      disabled={isUploading || isAuthenticating || !plainTextData.trim()}
                      className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl text-sm sm:text-base font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-700/30"
                    >
                      <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isUploading ? t('playground.tryItNow.uploadingText') : isAuthenticating ? t('playground.tryItNow.authenticating') : t('playground.tryItNow.uploadText')}
                    </button>
                    <button
                      onClick={() => {
                        setPlainTextData('');
                        setPlainTextFilename('data.txt');
                        setIsPlainTextJson(false);
                      }}
                      className="cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700/50 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-700 transition-all"
                      disabled={isUploading || isAuthenticating}
                    >
                      {t('playground.tryItNow.clear')}
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

              {latestRequestResponse && (
                <RequestResponseViewer 
                  data={latestRequestResponse}
                  onClose={() => setLatestRequestResponse(null)}
                />
              )}
            </>
          ) : (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 px-4">
                  {t('playground.tryItNow.success.title')}
                </h3>
              </div>

              <div className="bg-purple-900/20 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4 border border-purple-700/30">
                <div>
                  <p className="text-xs sm:text-sm text-purple-300 mb-1">{t('playground.tryItNow.success.fileName')}</p>
                  <p className="text-white font-medium text-sm sm:text-base break-all">
                    {uploadedFileName || uploadResult.data.fileId}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-purple-300 mb-1">{t('playground.tryItNow.success.publicUrl')}</p>
                  <div className="flex items-center gap-2 bg-purple-950/50 rounded-lg p-2 sm:p-3 border border-purple-800/30 group">
                    <p className="text-purple-400 text-xs sm:text-sm break-all flex-1 min-w-0">
                      {assembleFileUrl(uploadResult.data.fileId)}
                    </p>
                    <a
                      href={assembleFileUrl(uploadResult.data.fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-all hover:scale-110 relative flex-shrink-0"
                      title={t('playground.tryItNow.success.openInNewTab')}
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></span>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                    </a>
                  </div>
                  {uploadResult.data.status === 'pending' && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">{t('playground.tryItNow.success.pending')}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-purple-700/30">
                  <div>
                    <p className="text-xs text-purple-300 mb-1">{t('playground.tryItNow.success.originalSize')}</p>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {formatFileSize(uploadResult.data.originalSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">{t('playground.tryItNow.success.finalSize')}</p>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {formatFileSize(uploadResult.data.totalSize)}
                      {uploadResult.data.compressed && (
                        <span className="text-green-400 text-xs ml-1 sm:ml-2">
                          {t('playground.tryItNow.success.compressed')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">{t('playground.tryItNow.success.chunks')}</p>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {uploadResult.data.chunks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 mb-1">{t('playground.tryItNow.success.status')}</p>
                    <p className="text-white font-medium text-sm sm:text-base capitalize">
                      {uploadResult.data.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                <Link
                  href={assembleFileUrl(uploadResult.data.fileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl text-sm sm:text-base font-medium hover:from-purple-600 hover:to-purple-500 transition-all flex items-center justify-center gap-2 hover:scale-105 transform shadow-lg shadow-purple-700/30"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('playground.tryItNow.success.viewInExplorer')}
                </Link>
                <button
                  onClick={handleUploadAnother}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700/50 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-700 transition-all hover:scale-105 transform"
                >
                  {t('playground.tryItNow.success.uploadAnother')}
                </button>
              </div>

              {latestRequestResponse && (
                <RequestResponseViewer 
                  data={latestRequestResponse}
                  onClose={() => setLatestRequestResponse(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

