"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, ReactNode } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = true, glow = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden",
          hover && "cursor-pointer transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
          glow && "hover:border-[var(--accent-primary)] hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export { Card };
