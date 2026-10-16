'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalToastHandler: ((type: ToastType, title: string, message?: string) => void) | null = null;

export const toast = {
  success: (title: string, message?: string) => globalToastHandler?.('success', title, message),
  error: (title: string, message?: string) => globalToastHandler?.('error', title, message),
  info: (title: string, message?: string) => globalToastHandler?.('info', title, message),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  React.useEffect(() => {
    globalToastHandler = addToast;
    return () => {
      globalToastHandler = null;
    };
  }, [addToast]);

  const value = {
    toast: addToast,
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border border-border-token bg-surface p-4 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2',
                t.type === 'success' && 'border-status-success/30',
                t.type === 'error' && 'border-status-danger/30',
                t.type === 'info' && 'border-accent-ice/30',
              )}
            >
              {t.type === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-status-success shrink-0 mt-0.5" />
              )}
              {t.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-status-danger shrink-0 mt-0.5" />
              )}
              {t.type === 'info' && <Info className="h-5 w-5 text-accent-ice shrink-0 mt-0.5" />}

              <div className="flex-1 overflow-hidden">
                <p className="font-display text-xs font-semibold text-text">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">{t.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-muted hover:text-text transition-colors p-0.5 -mr-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
