"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
  addToastFn?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToastFn = (message, type: ToastType) => {
      const id = Date.now().toString(36);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  const typeStyles: Record<ToastType, string> = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-slide-up ${typeStyles[toast.type]}`}
        >
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
