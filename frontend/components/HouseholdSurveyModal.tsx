'use client';

import { useState, useEffect } from 'react';
import Button from './Button';

interface HouseholdSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  houseDoorNo: string;
  slumName: string;
  completedCount: number;
  totalCount: number;
}

export const HouseholdSurveyModal = ({
  isOpen,
  onClose,
  onSubmit,
  houseDoorNo,
  slumName,
  completedCount,
  totalCount
}: HouseholdSurveyModalProps) => {
  if (!isOpen) return null;

  const isAllCompleted = completedCount >= totalCount;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-white mb-2">Survey Submitted Successfully!</h3>
          
          <p className="text-slate-300 mb-4">
            Household survey submitted for House No: <span className="font-semibold">{houseDoorNo || 'N/A'}</span>
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Progress: {completedCount} of {totalCount} households</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              ></div>
            </div>
          </div>
          
          {isAllCompleted ? (
            <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <p className="text-blue-200 text-sm">
                <strong>All households in {slumName} have been surveyed!</strong>
                <br />
                If you believe there are more households to survey, please contact your supervisor 
                to update the total count through the slum survey.
              </p>
            </div>
          ) : (
            <p className="text-slate-300 mb-6">
              {remainingCount} household{remainingCount !== 1 ? 's' : ''} remaining in {slumName}.
              <br />
              Would you like to continue surveying?
            </p>
          )}
          
          <div className="flex gap-3 justify-center">
            {!isAllCompleted ? (
              <>
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Return to Dashboard
                </Button>
                <Button
                  onClick={onSubmit}
                >
                  Continue Surveying
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};