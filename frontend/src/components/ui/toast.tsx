/**
 * Simple toast notification system.
 */

"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "loading" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => string;
  dismissToast: (id: string) => void;
  updateToast: (id: string, message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds (except loading)
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    } else {
      // Failsafe: auto-dismiss loading toasts after 3 minutes with timeout message
      setTimeout(() => {
        setToasts((prev) => {
          const toast = prev.find((t) => t.id === id);
          if (toast && toast.type === "loading") {
            // Update to error and then dismiss
            return prev.map((t) =>
              t.id === id ? { ...t, message: "Operation timed out", type: "error" as ToastType } : t
            );
          }
          return prev;
        });
        // Then dismiss after showing the error
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }, 180000); // 3 minutes
    }

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, message: string, type: ToastType) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, type } : t))
    );

    // Auto dismiss after update (except loading)
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    loading: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
    info: <CheckCircle className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 min-w-[300px] max-w-[400px] animate-in slide-in-from-right-5"
      )}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm text-stone-700 dark:text-stone-200">
        {toast.message}
      </span>
      {toast.type !== "loading" && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
        >
          <X className="h-4 w-4 text-stone-400" />
        </button>
      )}
    </div>
  );
}
