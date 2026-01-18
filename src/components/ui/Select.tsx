"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-white rounded-xl px-4 py-3 pr-12 appearance-none cursor-pointer",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20",
              "hover:border-[var(--text-muted)]",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[var(--text-muted)]">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[var(--card-bg)]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
            aria-hidden="true"
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

Select.displayName = "Select";

export { Select };
