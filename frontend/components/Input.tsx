"use client";

import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  fullWidth = true,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2.5">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg
          text-text-primary placeholder-text-muted
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-error focus:ring-error" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
      {helperText && !error && (
        <p className="mt-2 text-sm text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
