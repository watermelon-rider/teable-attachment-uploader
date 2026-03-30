'use client';

import React, { useState, useEffect } from 'react';
import { TeableConfig } from '@/types';
import { parseTeableUrl, getTables } from '@/lib/api';
import { IconClose, IconSettings } from './Icons';
import { ToastType } from './Toast';

interface SettingsModalProps {
  isOpen: boolean;
  isForced?: boolean;
  onClose: () => void;
  onSave: (config: TeableConfig) => void;
  showToast: (message: string, type?: ToastType) => void;
}

export function SettingsModal({ isOpen, isForced, onClose, onSave, showToast }: SettingsModalProps) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      showToast('请填写完整信息', 'error');
      return;
    }

    const parsed = parseTeableUrl(url.trim());
    if (!parsed) {
      showToast('URL 格式错误，请复制浏览器地址栏完整链接', 'error');
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
      showToast('连接成功');
    } catch (err) {
      showToast(`连接失败: ${(err as Error).message}`, 'error');
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
            连接到 Teable
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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Teable URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://app.teable.cn/base/bseXXX/table/tblXXX/viwXXX"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              支持完整链接或短链接（如：https://app.teable.ai/base/bseXXX）
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="teable_xxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              在 Teable 设置中生成的 Personal Access Token
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-2.5">
          {!isForced && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 rounded text-sm font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading ? '验证中...' : '连接并保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
