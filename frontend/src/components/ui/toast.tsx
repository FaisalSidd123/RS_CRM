import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title?: string; message: string; type?: "default" | "success" | "error" | "warning" | "info"; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let globalToast: ToastContextType | null = null;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    if (globalToast) return globalToast;
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return context;
};

export const toast = {
  success: (message: string, title?: string) => globalToast?.success(message, title),
  error: (message: string, title?: string) => globalToast?.error(message, title),
  warning: (message: string, title?: string) => globalToast?.warning(message, title),
  info: (message: string, title?: string) => globalToast?.info(message, title),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "default", duration = 4000 }: { title?: string; message: string; type?: "default" | "success" | "error" | "warning" | "info"; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (message, title) => addToast({ message, title: title || "Success", type: "success" }),
    error: (message, title) => addToast({ message, title: title || "Error", type: "error" }),
    warning: (message, title) => addToast({ message, title: title || "Attention", type: "warning" }),
    info: (message, title) => addToast({ message, title: title || "Note", type: "info" }),
  };

  globalToast = contextValue;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";
          const isInfo = t.type === "info";

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-[8px] p-3.5 shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-5 duration-200 bg-white",
                isSuccess && "border-emerald-200 bg-emerald-50/90 text-emerald-950",
                isError && "border-red-200 bg-red-50/90 text-red-950",
                isWarning && "border-amber-200 bg-amber-50/90 text-amber-950",
                isInfo && "border-blue-200 bg-blue-50/90 text-blue-950",
                !isSuccess && !isError && !isWarning && !isInfo && "border-slate-200 bg-white text-slate-900"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {isError && <AlertCircle className="h-4 w-4 text-red-600" />}
                {isWarning && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                {isInfo && <Info className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1 space-y-0.5">
                {t.title && <p className="font-semibold text-xs">{t.title}</p>}
                <p className="text-xs opacity-90">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-sm opacity-60 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

