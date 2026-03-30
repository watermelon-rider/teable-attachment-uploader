'use client';

import React, { useEffect, useState } from 'react';
import { IconCheck, IconClose, IconWarning } from './Icons';

export type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-[68px] right-5 z-50 flex flex-col gap-2.5">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  const iconMap = {
    success: <IconCheck className="w-4 h-4" size={16} />,
    error: <IconClose className="w-4 h-4" size={16} />,
    warning: <IconWarning className="w-4 h-4" size={16} />,
  };

  const styleMap = {
    success: 'bg-success-light text-success border-success/30',
    error: 'bg-error-light text-error border-error/30',
    warning: 'bg-warning-light text-warning-800 border-warning/30',
  };

  return (
    <div
      className={`min-w-[260px] px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2.5 border shadow-md transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      } ${styleMap[toast.type]}`}
      style={{ animation: 'slideIn 0.2s ease' }}
    >
      <span className="flex items-center">{iconMap[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
