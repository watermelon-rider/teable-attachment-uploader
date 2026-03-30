'use client';

import React from 'react';
import { UploadFile, ExcelData, MainTab } from '@/types';
import { formatSize } from '@/lib/utils';
import { IconExcel, IconFolder, IconClose, IconAttachment, IconFile, IconImage } from './Icons';

interface FileListProps {
  files: UploadFile[];
  mainTab: MainTab;
  excelData: ExcelData | null;
  onRemove: (index: number) => void;
}

export function FileList({ files, mainTab, excelData, onRemove }: FileListProps) {
  if (files.length === 0) {
    const emptyMsg = mainTab === 'excel' ? '暂无文件，请选择要导入的嵌图表格' : '暂无文件，请选择要上传的附件';
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <IconFolder size={32} />
          </div>
          <p className="text-[12px] text-gray-400">{emptyMsg}</p>
        </div>
      </div>
    );
  }

  if (mainTab === 'excel' && excelData) {
    const item = files[0];
    const imgCount = Object.keys(excelData.images || {}).length;
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[1fr_70px_80px_32px] gap-2 items-center px-4 py-2 border-b border-gray-100 hover:bg-gray-50/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <IconExcel size={12} />
            </div>
            <span className="text-[12px] text-gray-700 truncate">{item.file.name}</span>
          </div>
          <div className="text-[11px] text-gray-400">{item.excelInfo?.rows || 0} 行 / {imgCount} 图</div>
          <StatusBadge status={item.status} errorMsg={item.errorMsg} />
          <button
            onClick={() => onRemove(0)}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
          >
            <IconClose size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {files.map((item, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_70px_80px_32px] gap-2 items-center px-4 py-2 border-b border-gray-100 hover:bg-gray-50/50"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <FileIcon filename={item.file.name} />
            </div>
            <span className="text-[12px] text-gray-700 truncate">{item.file.name}</span>
          </div>
          <div className="text-[11px] text-gray-400">{formatSize(item.file.size)}</div>
          <StatusBadge status={item.status} errorMsg={item.errorMsg} />
          <button
            onClick={() => onRemove(i)}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
          >
            <IconClose size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, errorMsg }: { status: string; errorMsg?: string }) {
  const statusMap: Record<string, { text: string; className: string }> = {
    pending: { text: '待上传', className: 'bg-gray-100 text-gray-500' },
    uploading: { text: '上传中', className: 'bg-primary-light text-primary' },
    success: { text: '完成', className: 'bg-success-light text-success' },
    error: { text: errorMsg || '失败', className: 'bg-error-light text-error' },
    matched: { text: '已匹配', className: 'bg-warning-light text-warning-800' },
  };

  const { text, className } = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-500' };

  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded text-center ${className}`}>
      {text}
    </span>
  );
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
    return <IconImage size={12} />;
  }
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return <IconExcel size={12} />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
    return <IconFile size={12} />;
  }
  return <IconAttachment size={12} />;
}
