"use client";

import { useState, useEffect } from "react";
import Button from "./Button";
import apiService from "@/services/api";

interface AssignmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment: {
    _id: string;
    status: string;
    slumSurveyStatus?: string;
    slum: {
      slumName: string;
      slumId: string | number;
    } | null;
    householdSurveyProgress?: {
      completed: number;
      total: number;
    };
  } | null;
}

export default function AssignmentStatusModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}: AssignmentStatusModalProps) {
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && assignment) {
      setAssignmentStatus(assignment.status);
      setError("");
    }
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = () => {
    // Only show confirmation modal if status has actually changed
    if (assignmentStatus === assignment.status) {
      setError(
        "No changes detected. Status is already set to " + assignmentStatus,
      );
      return;
    }

    // Show confirmation modal only if there's a change
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError("");

    try {
      const response = await apiService.updateAssignmentManualStatus(
        assignment._id,
        {
          assignmentStatus,
        },
      );

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
  };

  const householdProgress = assignment.householdSurveyProgress;
  const isProgressComplete =
    householdProgress &&
    householdProgress.total > 0 &&
    householdProgress.completed >= householdProgress.total;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Update Assignment Status
          </h2>
          <p className="text-sm text-slate-400">
            {assignment.slum?.slumName || "Unknown Slum"}
          </p>
        </div>

        {/* Household Progress Info */}
        {householdProgress && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-300 mb-2 font-medium">
              Household Survey Progress
            </p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">
                {householdProgress.completed} of {householdProgress.total}{" "}
                completed
              </span>
              <span className="text-white font-medium">
                {Math.round(
                  (householdProgress.completed / householdProgress.total) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isProgressComplete ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(100, (householdProgress.completed / householdProgress.total) * 100)}%`,
                }}
              ></div>
            </div>
            {isProgressComplete && (
              <p className="text-xs text-green-400 mt-2">
                ✓ All household surveys completed
              </p>
            )}
          </div>
        )}

        {/* Slum Survey Status - Read Only */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Slum Survey Status
          </label>
          <div className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300">
            {assignment.slumSurveyStatus || "NOT STARTED"}
          </div>
        </div>

        {/* Status Forms */}
        <div className="space-y-4 mb-6">
          {/* Assignment Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Assignment Status
            </label>
            <select
              value={assignmentStatus}
              onChange={(e) => setAssignmentStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        {/* Warning if marking complete without full household coverage */}
        {!isProgressComplete && assignmentStatus === "COMPLETED" && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-lg">
            <p className="text-sm text-amber-300">
              ⚠️ Warning: You are marking this assignment as COMPLETED even
              though not all household surveys have been submitted (
              {householdProgress?.completed}/{householdProgress?.total}).
              Continue anyway?
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Update Status
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">
                Confirm Status Update
              </h3>
              <p className="text-slate-300 mb-2">
                Are you sure you want to update the assignment status?
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="text-white font-medium">
                    {assignment.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">New Status:</span>
                  <span className="text-blue-400 font-medium">
                    {assignmentStatus}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={cancelUpdate}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmUpdate}
                  loading={loading}
                  className="flex-1"
                >
                  Confirm Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
