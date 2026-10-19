import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose?: number | false;
}

export interface ToastOptions {
  autoClose?: number | false;
}

export interface ToastContainerProps {
  position?: string;
  autoClose?: number;
  hideProgressBar?: boolean;
  newestOnTop?: boolean;
  closeOnClick?: boolean;
  rtl?: boolean;
  pauseOnFocusLoss?: boolean;
  draggable?: boolean;
  pauseOnHover?: boolean;
  theme?: string;
  className?: string;
}

type ToastListener = (toast: ToastItem) => void;
let toastListeners: ToastListener[] = [];

const emitToast = (toastData: Omit<ToastItem, 'id'>) => {
  const id = Date.now() + Math.random().toString(36).substring(2, 6);
  const newToast: ToastItem = { id, autoClose: 3500, ...toastData };
  toastListeners.forEach((listener) => listener(newToast));
};

export const toast = {
  success: (message: string, options: ToastOptions = {}) => emitToast({ type: 'success', message, ...options }),
  error: (message: string, options: ToastOptions = {}) => emitToast({ type: 'error', message, ...options }),
  warning: (message: string, options: ToastOptions = {}) => emitToast({ type: 'warning', message, ...options }),
  info: (message: string, options: ToastOptions = {}) => emitToast({ type: 'info', message, ...options }),
};

export const showToast = toast;

export const ToastContainer: React.FC<ToastContainerProps> = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleAddToast: ToastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      if (newToast.autoClose !== false) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.autoClose || 3500);
      }
    };

    toastListeners.push(handleAddToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleAddToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 fade-in ${
            t.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
              : t.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-950'
              : t.type === 'warning'
              ? 'bg-amber-50/95 border-amber-200 text-amber-950'
              : 'bg-blue-50/95 border-blue-200 text-blue-950'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

          <div className="flex-1 text-sm font-medium leading-snug break-words">
            {t.message}
          </div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default toast;
