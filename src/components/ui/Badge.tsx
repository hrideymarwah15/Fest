"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "individual" | "team" | "outline";
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = "default", children, className }: BadgeProps) => {
  const variants = {
    default: "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--card-border)]",
    success: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    warning: "bg-blue-300/20 text-blue-300 border-blue-300/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    individual: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    team: "bg-blue-700/20 text-blue-700 border-blue-700/30",
    outline: "bg-transparent border-[var(--text-muted)] text-[var(--text-secondary)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
