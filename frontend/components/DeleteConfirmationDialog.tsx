"use client";

import { Trash2 } from "lucide-react";
import Button from "@/components/Button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  icon?: React.ReactNode;
  confirmButtonStyle?: string;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Deleting...",
  icon,
  confirmButtonStyle = "bg-red-600 hover:bg-red-700",
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${loading ? 'pointer-events-none' : ''}`}>
      <div className={`bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl ${loading ? 'pointer-events-auto' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500/20 p-3 rounded-lg">
            {icon || <Trash2 className="w-5 h-5 text-red-400" />}
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmButtonStyle} w-full sm:w-auto`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loadingText}
              </span>
            ) : confirmText}
          </Button>
          <Button 
            variant="secondary" 
            size="md"
            onClick={onCancel} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
