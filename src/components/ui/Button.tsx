"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-300 ease-out rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]",
      secondary:
        "bg-[var(--accent-secondary)] text-white hover:bg-[var(--accent-secondary-hover)] hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]",
      tertiary:
        "bg-[var(--accent-tertiary)] text-white hover:bg-[var(--accent-tertiary-hover)] hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-orange-500/10 hover:to-red-500/10",
      danger:
        "bg-[var(--accent-tertiary)] text-white hover:bg-[var(--accent-tertiary-hover)] hover:shadow-lg hover:shadow-red-500/20",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-3.5 text-sm",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
