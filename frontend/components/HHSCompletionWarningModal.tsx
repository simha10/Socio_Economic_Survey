"use client";

import { CheckCircle } from "lucide-react";
import Button from "@/components/Button";

interface HHSCompletionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HHSCompletionWarningModal({
  isOpen,
  onClose,
}: HHSCompletionWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-4 sm:p-6 max-w-md w-full sm:mx-4 mx-2 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-white">All Households Surveyed</h2>
        </div>

        <p className="text-slate-400 mb-6 leading-relaxed">
          All HHS have been done if you have more houses to survey, update it through slum survey page or reach your supervisor for the query.
        </p>

        <div className="flex justify-end">          
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
