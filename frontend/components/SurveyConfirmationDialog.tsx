"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface SurveyConfirmationDialogProps {
  isOpen: boolean;
  surveyType: "slum" | "household";
  slumName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SurveyConfirmationDialog({
  isOpen,
  surveyType,
  slumName,
  onConfirm,
  onCancel,
  loading = false,
}: SurveyConfirmationDialogProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    return surveyType === "slum" 
      ? "Start Slum Survey" 
      : "Start Household Survey";
  };

  const getMessage = () => {
    return surveyType === "slum"
      ? `Are you sure you want to start the slum survey for "${slumName}"?`
      : `Are you sure you want to start the household survey for "${slumName}"?`;
  };

  const getIconColor = () => {
    return surveyType === "slum" ? "text-amber-400" : "text-blue-400";
  };

  const getButtonColor = () => {
    return surveyType === "slum" 
      ? "bg-amber-600 hover:bg-amber-700" 
      : "bg-blue-600 hover:bg-blue-700";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`bg-${surveyType === "slum" ? "amber" : "blue"}-500/20 p-3 rounded-lg`}>
            <AlertTriangle className={`w-5 h-5 ${getIconColor()}`} />
          </div>
          <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
        </div>

        <p className="text-slate-300 mb-6">{getMessage()}</p>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className={getButtonColor()}
          >
            {loading ? "Starting..." : "Proceed"}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}