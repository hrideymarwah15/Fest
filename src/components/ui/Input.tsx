"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-white rounded-lg px-4 py-3 transition-all duration-300",
              "focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_var(--accent-primary-dim)]",
              "placeholder:text-[var(--text-muted)]",
              icon && "pl-14",
              error && "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
