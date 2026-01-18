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
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    error: "bg-red-500/20 text-red-400 border-red-500/30",
    individual: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    team: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    outline: "bg-transparent border-[var(--card-border)] text-[var(--text-secondary)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border",
        "transition-all duration-200 hover:scale-105",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
