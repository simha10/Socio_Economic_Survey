"use client";

import { Pencil, AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface EditConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function EditConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: EditConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {loading ? "Editing..." : "Edit Survey"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}