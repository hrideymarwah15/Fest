"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
}

// Simple text component with subtle hover glow - no glitch animation
const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover={{
        textShadow: "0 0 20px rgba(96, 165, 250, 0.4)",
      }}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.span>
  );
};

export default GlitchText;
