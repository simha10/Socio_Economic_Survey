"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface EditConfirmationDialogProps {
  isOpen: boolean;
  surveyType: "slum" | "household";
  entityIdentifier: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function EditConfirmationDialog({
  isOpen,
  surveyType,
  entityIdentifier,
  onConfirm,
  onCancel,
  loading = false,
}: EditConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Edit {surveyType === "slum" ? "Slum" : "Household"} Details</h2>
        </div>

        <p className="text-slate-400 mb-6">
          {surveyType === "slum" 
            ? `Are you sure you want to edit the slum details for "${entityIdentifier}"? This will allow you to modify ward number, village, and land ownership information.`
            : `Are you sure you want to edit the ${surveyType} details for household: ${entityIdentifier}? This will allow you to modify the household details.`}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">          
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
          >
            {loading ? "Editing..." : surveyType === "slum" ? "Edit Slum" : "Edit Survey"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}