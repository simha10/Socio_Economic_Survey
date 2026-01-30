"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  completionPercentage?: number;
  onStepChange?: (step: number) => void; 
}

export default function Stepper({
  steps,
  currentStep,
  completionPercentage = 0,
  onStepChange,
}: StepperProps) {
  const currentTitle = steps[currentStep];

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 gap-2">
        <div>
           <p className="text-sm text-slate-400 mt-1">Section {currentStep + 1} of {steps.length} (15 total)</p>
        </div>
        <div className="text-right hidden sm:block">
           <span className="text-sm font-medium text-slate-300">{completionPercentage}% Complete</span>
        </div>
      </div>
      
      {/* Progress Bar Track */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
        {/* Animated Progress Fill */}
        <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${completionPercentage === 0 ? 'bg-red-500' : completionPercentage < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      {/* Mobile percentage text */}
      <div className="mt-2 text-right sm:hidden">
         <span className="text-xs font-medium text-slate-300">{completionPercentage}% Complete</span>
      </div>
    </div>
  );
}
