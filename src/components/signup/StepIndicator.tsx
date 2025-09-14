
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i + 1}
          className={`w-3 h-3 rounded-full ${
            i + 1 <= currentStep
              ? "bg-gradient-to-r from-pink-500 to-purple-500"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};
