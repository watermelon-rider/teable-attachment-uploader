'use client';

import React, { useState, useEffect } from 'react';
import { TeableConfig } from '@/types';
import { parseTeableUrl, getTables } from '@/lib/api';
import { IconClose, IconSettings } from './Icons';
import { ToastType } from './Toast';
import { useI18n } from '@/lib/i18n-context';
import { Language } from '@/lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  isForced?: boolean;
  onClose: () => void;
  onSave: (config: TeableConfig) => void;
  showToast: (message: string, type?: ToastType) => void;
}

export function SettingsModal({ isOpen, isForced, onClose, onSave, showToast }: SettingsModalProps) {
  const { t, lang, setLang } = useI18n();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for mixed content issue (HTTPS page trying to access HTTP API)
  const isMixedContent = () => {
    if (typeof window === 'undefined') return false;
    const isPageHttps = window.location.protocol === 'https:';
    const isUrlHttp = url.trim().toLowerCase().startsWith('http:');
    return isPageHttps && isUrlHttp;
  };

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem('teaUploaderConfig');
    if (saved) {
      try {
        const config: TeableConfig = JSON.parse(saved);
        const fullUrl = config.tableId 
          ? `${config.baseUrl}/base/${config.baseId}/table/${config.tableId}`
          : `${config.baseUrl}/base/${config.baseId}`;
        setUrl(fullUrl);
        setToken(config.token);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!url.trim() || !token.trim()) {
      showToast(t.pleaseFillAllFields, 'error');
      return;
    }

    const parsed = parseTeableUrl(url.trim());
    if (!parsed) {
      showToast(t.urlFormatError, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const testConfig: TeableConfig = {
        baseUrl: parsed.baseUrl,
        baseId: parsed.baseId,
        tableId: parsed.tableId,
        token: token.trim(),
      };

      // Test connection
      await getTables(testConfig);
      onSave(testConfig);
      showToast(t.connectedSuccess);
    } catch (err) {
      showToast(`${t.connectionFailed}: ${(err as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[200] backdrop-blur-[2px]">
      <div className="bg-white rounded-lg w-[90%] max-w-[480px] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="px-6 py-5 border-b border-gray-300 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <IconSettings className="w-4 h-4" size={16} />
            {t.connectToTeable}
          </div>
          {!isForced && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <IconClose size={18} />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{t.language}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                  lang === 'en'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.languageEn}
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                  lang === 'zh'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.languageZh}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.teableUrl}</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.teableUrlPlaceholder}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              {t.teableUrlHint}
            </p>
            {isMixedContent() && (
              <p className="text-[11px] text-red-600 mt-1.5 font-medium bg-red-50 px-2 py-1.5 rounded border border-red-200">
                {t.mixedContentWarning}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t.apiToken}</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t.apiTokenPlaceholder}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              {t.apiTokenHint}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-2.5">
          {!isForced && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {t.cancel}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 rounded text-sm font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading ? t.verifying : t.connectAndSave}
          </button>
        </div>
      </div>
    </div>
  );
}
