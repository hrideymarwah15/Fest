"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center justify-center w-5 h-5">
              {icon}
            </div>
          )}
          {icon && iconPosition === "right" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center justify-center w-5 h-5">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-white rounded-xl px-4 py-3",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20",
              "placeholder:text-[var(--text-muted)]",
              "hover:border-[var(--text-muted)]",
              icon && iconPosition === "left" && "pl-12",
              icon && iconPosition === "right" && "pr-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            error ? "max-h-10 opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
