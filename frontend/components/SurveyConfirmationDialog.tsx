"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import Button from "@/components/Button";

interface SurveyConfirmationDialogProps {
  isOpen: boolean;
  surveyType: "slum" | "household";
  slumName: string;
  surveyStatus?: "DRAFT" | "IN PROGRESS" | "SUBMITTED" | "COMPLETED";
  progressCompleted?: number;
  progressTotal?: number;
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
  progressCompleted,
  progressTotal,
  onConfirm,
  onCancel,
  onPreview,
  onEdit,
  loading = false,
}: SurveyConfirmationDialogProps) {
  if (!isOpen) return null;

  const hasProgress = surveyType === "household" && progressTotal !== undefined && progressTotal > 0;
  const isContinuing = hasProgress && (progressCompleted || 0) > 0;
  const isAllCompleted = hasProgress && progressCompleted !== undefined && progressTotal !== undefined && progressCompleted >= progressTotal;

  const getTitle = () => {
    if (isAllCompleted) {
      return "All Household Surveys Completed";
    }
    if (isContinuing) {
      return "Continue Household Survey";
    }
    if (surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") {
      return "Survey Already Submitted";
    } else if (surveyStatus === "IN PROGRESS") {
      return "Continue Survey";
    } else {
      return surveyType === "slum"
        ? "Start Slum Survey"
        : "Start Household Survey";
    }
  };

  const getMessage = () => {
    if (isAllCompleted) {
      return `All ${progressTotal} household surveys for "${slumName}" have been completed. Would you like to preview or edit any household surveys?`;
    }
    if (isContinuing) {
      return `You have completed ${progressCompleted} of ${progressTotal} household surveys for "${slumName}". Would you like to continue with the next household survey?`;
    }
    if (surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED") {
      return `This ${surveyType} survey has already been submitted. Would you like to preview it or edit it?`;
    } else if (surveyStatus === "IN PROGRESS") {
      return `You have an in-progress ${surveyType} survey for "${slumName}". Would you like to continue filling the form?`;
    } else {
      return surveyType === "slum"
        ? `Are you sure you want to start the slum survey for "${slumName}"?`
        : `Are you sure you want to start the household survey for "${slumName}"?`;
    }
  };

  const getIcon = () => {
    if (isAllCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (isContinuing) {
      return <CheckCircle className="w-5 h-5 text-blue-400" />;
    }
    return <AlertTriangle className={`w-5 h-5 ${getIconColor()}`} />;
  };

  const getIconColor = () => {
    return surveyType === "slum" ? "text-amber-400" : "text-blue-400";
  };

  const getButtonColor = () => {
    if (isAllCompleted) {
      return "bg-green-600 hover:bg-green-700";
    }
    return surveyType === "slum"
      ? "bg-amber-600 hover:bg-amber-700"
      : "bg-blue-600 hover:bg-blue-700";
  };

  const getConfirmButtonText = () => {
    if (loading) {
      if (isContinuing || surveyStatus === "IN PROGRESS") {
        return "Continuing...";
      }
      return "Starting...";
    }

    if (isAllCompleted) {
      return "View Surveys";
    }
    if (isContinuing) {
      return "Continue Survey";
    }
    if (surveyStatus === "IN PROGRESS") {
      return "Continue Survey";
    }
    return "Start Survey";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${isAllCompleted ? "bg-green-500/20" : isContinuing ? "bg-blue-500/20" : surveyType === "slum" ? "bg-amber-500/20" : "bg-blue-500/20"} p-3 rounded-lg`}>
            {getIcon()}
          </div>
          <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
        </div>

        <p className="text-slate-300 mb-4">{getMessage()}</p>

        {/* Progress Bar for Household Survey */}
        {hasProgress && !isAllCompleted && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progress</span>
              <span className="text-sm font-medium text-white">
                {progressCompleted} / {progressTotal} households
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all"
                style={{
                  width: `${progressTotal > 0 ? ((progressCompleted || 0) / progressTotal) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* All Completed Message */}
        {isAllCompleted && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400 text-center">
              All household surveys have been completed!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {(surveyStatus === "SUBMITTED" || surveyStatus === "COMPLETED" || isAllCompleted) ? (
            <>
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
              <Button
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={onConfirm}
                disabled={loading}
                className={`${getButtonColor()} w-full sm:w-auto`}
              >
                {getConfirmButtonText()}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}