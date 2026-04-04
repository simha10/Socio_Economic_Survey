"use client";

import React, { useState, useEffect } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

const toastContext = React.createContext<{
  showToast: (
    message: string,
    type: ToastMessage["type"],
    duration?: number,
  ) => void;
}>({
  showToast: () => {},
});

export function useToast() {
  return React.useContext(toastContext);
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: ToastMessage["type"],
    duration = 3000,
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  return (
    <toastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 space-y-2 pointer-events-none z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </toastContext.Provider>
  );
}

function Toast({ message, type }: ToastMessage) {
  const typeClasses = {
    success: "bg-success text-white",
    error: "bg-error text-white",
    info: "bg-primary text-white",
    warning: "bg-warning text-white",
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg
        ${typeClasses[type]}
        pointer-events-auto animate-fade-in
      `}
    >
      {message}
    </div>
  );
}
