"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface CursorProps {
  children: React.ReactNode;
}

const Cursor = ({ children }: CursorProps) => {
  const [mounted, setMounted] = useState(false);
  const [cursorVariant, setCursorVariant] = useState("default");
  const [cursorIcon, setCursorIcon] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const getSportIcon = useCallback((sportName: string | null): string => {
    if (!sportName) return "⚽";
    
    const icons: Record<string, string> = {
      football: "⚽",
      basketball: "🏀",
      cricket: "🏏",
      tennis: "🎾",
      badminton: "🏸",
      volleyball: "🏐",
      swimming: "🏊",
      athletics: "🏃",
      chess: "♟️",
      hockey: "🏑",
      tabletennis: "🏓",
      "table tennis": "🏓",
      kabaddi: "🤼",
      boxing: "🥊",
      wrestling: "🤼",
      archery: "🏹",
    };
    
    return icons[sportName.toLowerCase()] || "🎯";
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Detect touch devices
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  useEffect(() => {
    // Don't add event listeners on touch devices or SSR
    if (typeof window === 'undefined' || isTouchDevice || !mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for sport icons
      const sportElement = target.closest('[data-sport]');
      if (sportElement) {
        const sportName = sportElement.getAttribute('data-sport');
        setCursorIcon(getSportIcon(sportName));
        setCursorVariant("sport");
        return;
      }

      // Check for interactive elements
      if (target.matches('button, a, [role="button"], input, textarea, select, .cursor-pointer')) {
        setCursorVariant("hover");
        setCursorIcon(null);
      } else {
        setCursorVariant("default");
        setCursorIcon(null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isTouchDevice, mounted, getSportIcon]);

  const variants = {
    default: {
      scale: 1,
      backgroundColor: "rgba(96, 165, 250, 0.3)",
      borderColor: "rgba(96, 165, 250, 0.8)",
      width: 24,
      height: 24,
    },
    hover: {
      scale: 1.5,
      backgroundColor: "rgba(96, 165, 250, 0.6)",
      borderColor: "rgba(96, 165, 250, 1)",
      width: 32,
      height: 32,
    },
    sport: {
      scale: 2,
      backgroundColor: "rgba(96, 165, 250, 0.9)",
      borderColor: "rgba(96, 165, 250, 1)",
      width: 48,
      height: 48,
    },
  };

  if (!mounted || isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border-2 border-blue-400 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        variants={variants}
        animate={cursorVariant}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
        initial={false}
      >
        {cursorIcon && (
          <motion.span
            className="text-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {cursorIcon}
          </motion.span>
        )}
        {!cursorIcon && (
          <motion.div
            className="absolute inset-1 rounded-full bg-blue-400"
            animate={cursorVariant}
            variants={{
              default: { scale: 0.5, opacity: 0.5 },
              hover: { scale: 0.6, opacity: 0.7 },
              sport: { scale: 0, opacity: 0 },
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>

      {/* Cursor Trail */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-blue-400 rounded-full pointer-events-none z-[9998]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      {/* Content */}
      {children}
    </>
  );
};

export default Cursor;