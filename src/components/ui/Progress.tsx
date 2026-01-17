"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const Progress = ({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "default",
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variants = {
    default: "bg-[var(--accent-primary)]",
    success: "bg-blue-500",
    warning: "bg-blue-300",
    danger: "bg-red-500",
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full bg-[var(--card-border)] rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-[var(--text-muted)]">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export { Progress };
