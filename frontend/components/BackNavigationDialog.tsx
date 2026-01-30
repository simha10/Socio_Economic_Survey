"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface BackNavigationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BackNavigationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: BackNavigationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-blue-400" />
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
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {loading ? "Leaving..." : "Leave Survey"}
          </Button>
          <Button 
            variant="secondary" 
            size="md"
            onClick={onCancel} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Stay Here
          </Button>
        </div>
      </div>
    </div>
  );
}