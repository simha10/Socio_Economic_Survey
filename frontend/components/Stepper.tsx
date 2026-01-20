"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function Stepper({
  steps,
  currentStep,
  onStepChange,
}: StepperProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onStepChange(index)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full font-medium
                transition-all duration-200
                ${
                  index === currentStep
                    ? "bg-gradient-primary text-white shadow-lg"
                    : index < currentStep
                      ? "bg-success text-white"
                      : "bg-slate-700 text-text-muted"
                }
              `}
            >
              {index < currentStep ? "✓" : index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  index < currentStep ? "bg-success" : "bg-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-text-primary font-medium">
          {currentStep + 1} of {steps.length}
        </p>
        <p className="text-xs text-text-muted mt-1">{steps[currentStep]}</p>
      </div>
    </div>
  );
}
