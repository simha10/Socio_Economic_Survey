"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/Button";

interface SurveyConfirmationDialogProps {
  isOpen: boolean;
  surveyType: "slum" | "household";
  slumName: string;
  surveyStatus?: "DRAFT" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
  onConfirm: () => void;
  onCancel: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

export default function SurveyConfirmationDialog({
  isOpen,
  surveyType,
  slumName,
  surveyStatus = "DRAFT",
  onConfirm,
  onCancel,
  onPreview,
  onEdit,
  loading = false,
}: SurveyConfirmationDialogProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    if (surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") {
      return "Survey Already Submitted";
    } else if (surveyStatus === "IN_PROGRESS") {
      return "Continue Survey";
    } else {
      return surveyType === "slum" 
        ? "Start Slum Survey" 
        : "Start Household Survey";
    }
  };

  const getMessage = () => {
    if (surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") {
      return `This ${surveyType} survey has already been submitted. Would you like to preview it or edit it?`;
    } else if (surveyStatus === "IN_PROGRESS") {
      return `You have an in-progress ${surveyType} survey for "${slumName}". Would you like to continue filling the form?`;
    } else {
      return surveyType === "slum"
        ? `Are you sure you want to start the slum survey for "${slumName}"?`
        : `Are you sure you want to start the household survey for "${slumName}"?`;
    }
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
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`bg-${surveyType === "slum" ? "amber" : "blue"}-500/20 p-3 rounded-lg`}>
            <AlertTriangle className={`w-5 h-5 ${getIconColor()}`} />
          </div>
          <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
        </div>

        <p className="text-slate-300 mb-6">{getMessage()}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          {(surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") ? (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={onPreview}
                disabled={loading}
                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700"
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onEdit}
                disabled={loading}
                className={`${getButtonColor()} w-full sm:w-auto`}
              >
                {loading ? "Editing..." : "Edit"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onConfirm}
                disabled={loading}
                className={`${getButtonColor()} w-full sm:w-auto`}
              >
                {loading 
                  ? (surveyStatus === "IN_PROGRESS" ? "Continuing..." : "Starting...") 
                  : (surveyStatus === "IN_PROGRESS" ? "Continue Survey" : "Start Survey")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}