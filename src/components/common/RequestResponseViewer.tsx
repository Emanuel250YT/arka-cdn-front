'use client';

import { useState } from 'react';
import { Code, ChevronDown, ChevronUp, Copy, Check, X } from 'lucide-react';

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

interface RequestResponseViewerProps {
  data: RequestResponseData | null;
  onClose?: () => void;
  autoShow?: boolean;
}

export const RequestResponseViewer = ({ 
  data, 
  onClose,
  autoShow = true 
}: RequestResponseViewerProps) => {
  const [expandedSections, setExpandedSections] = useState({
    request: true,
    response: true,
  });
  const [copied, setCopied] = useState<string | null>(null);

  if (!data && !autoShow) return null;
  if (!data) return null;

  const toggleSection = (section: 'request' | 'response') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const formatBody = (body: unknown): string => {
    if (body === null || body === undefined) return '';
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    }
    if (typeof body === 'object') {
      return JSON.stringify(body, null, 2);
    }
    return String(body);
  };

  const formatHeaders = (headers?: Record<string, string>): string => {
    if (!headers) return '';
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-400';
    if (status >= 400) return 'text-red-400';
    return 'text-gray-400';
  };

  const requestBodyText = data.requestBody 
    ? formatBody(data.requestBody)
    : '';
  const responseBodyText = data.responseBody 
    ? formatBody(data.responseBody)
    : '';
  const requestHeadersText = formatHeaders(data.requestHeaders);
  const responseHeadersText = formatHeaders(data.responseHeaders);

  return (
    <div className="mt-4 bg-purple-950/30 border border-purple-700/30 rounded-xl overflow-hidden">
      <div className="bg-purple-900/20 border-b border-purple-700/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Request / Response</span>
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${
            data.method === 'GET' ? 'bg-blue-900/30 text-blue-300' :
            data.method === 'POST' ? 'bg-green-900/30 text-green-300' :
            data.method === 'PUT' ? 'bg-yellow-900/30 text-yellow-300' :
            data.method === 'DELETE' ? 'bg-red-900/30 text-red-300' :
            'bg-gray-900/30 text-gray-300'
          }`}>
            {data.method}
          </span>
          <span className="text-xs text-purple-400 font-mono truncate max-w-xs">
            {data.url}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-400/60 hover:text-purple-300 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="divide-y divide-purple-700/30">
        <div>
          <button
            onClick={() => toggleSection('request')}
            className="w-full px-4 py-3 bg-purple-900/10 hover:bg-purple-900/20 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-300">Request</span>
              <span className="text-xs text-purple-400">
                {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {expandedSections.request ? (
              <ChevronUp className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {expandedSections.request && (
            <div className="px-4 pb-4 space-y-3">
              {requestHeadersText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-300">Headers</span>
                    <button
                      onClick={() => copyToClipboard(requestHeadersText, 'req-headers')}
                      className="text-purple-400/60 hover:text-purple-300 transition-colors p-1"
                    >
                      {copied === 'req-headers' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-purple-950/50 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto border border-purple-800/30">
                    {requestHeadersText}
                  </pre>
                </div>
              )}

              {requestBodyText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-300">Body</span>
                    <button
                      onClick={() => copyToClipboard(requestBodyText, 'req-body')}
                      className="text-purple-400/60 hover:text-purple-300 transition-colors p-1"
                    >
                      {copied === 'req-body' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-purple-950/50 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto border border-purple-800/30 max-h-96 overflow-y-auto">
                    {requestBodyText}
                  </pre>
                </div>
              )}

              {!requestBodyText && !requestHeadersText && (
                <p className="text-xs text-purple-400/60 italic">No request body or headers</p>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection('response')}
            className="w-full px-4 py-3 bg-purple-900/10 hover:bg-purple-900/20 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-300">Response</span>
              {data.responseStatus && (
                <span className={`text-xs font-mono ${getStatusColor(data.responseStatus)}`}>
                  {data.responseStatus}
                </span>
              )}
              {data.error && (
                <span className="text-xs text-red-400">Error</span>
              )}
            </div>
            {expandedSections.response ? (
              <ChevronUp className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {expandedSections.response && (
            <div className="px-4 pb-4 space-y-3">
              {data.error ? (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                  <p className="text-xs text-red-300 font-mono">{data.error}</p>
                </div>
              ) : (
                <>
                  {responseHeadersText && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-300">Headers</span>
                        <button
                          onClick={() => copyToClipboard(responseHeadersText, 'res-headers')}
                          className="text-purple-400/60 hover:text-purple-300 transition-colors p-1"
                        >
                          {copied === 'res-headers' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-purple-950/50 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto border border-purple-800/30">
                        {responseHeadersText}
                      </pre>
                    </div>
                  )}

                  {responseBodyText && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-300">Body</span>
                        <button
                          onClick={() => copyToClipboard(responseBodyText, 'res-body')}
                          className="text-purple-400/60 hover:text-purple-300 transition-colors p-1"
                        >
                          {copied === 'res-body' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-purple-950/50 rounded-lg p-3 text-xs text-purple-200 font-mono overflow-x-auto border border-purple-800/30 max-h-96 overflow-y-auto">
                        {responseBodyText}
                      </pre>
                    </div>
                  )}

                  {!responseBodyText && !responseHeadersText && (
                    <p className="text-xs text-purple-400/60 italic">No response body or headers</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

