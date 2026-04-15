"use client";

import Button from "./Button";

interface ConfirmEditOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignment: {
    slum: {
      slumName: string;
      slumId: string | number;
    } | null;
  } | null;
}

export default function ConfirmEditOpenModal({
  isOpen,
  onClose,
  onConfirm,
  assignment,
}: ConfirmEditOpenModalProps) {
  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">
          Edit Assignment Status
        </h3>
        <p className="text-slate-300 mb-2">
          You are about to edit the status for:
        </p>
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <span className="text-slate-400">Slum:</span>
            <span className="text-white font-medium ml-2">
              {assignment.slum?.slumName || "Unknown"}
            </span>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          This will allow you to update the assignment status. Do you want to
          continue?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
