"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface CursorProps {
  children: React.ReactNode;
}

const Cursor = ({ children }: CursorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVariant, setCursorVariant] = useState("default");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], input, textarea, select')) {
        setIsHovering(true);
        setCursorVariant("hover");
      } else {
        setIsHovering(false);
        setCursorVariant("default");
      }
    };

    // Only add event listeners on client side
    if (typeof window !== 'undefined') {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseenter", handleMouseEnter);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseover", handleMouseOver);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseenter", handleMouseEnter);
        document.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("mouseover", handleMouseOver);
      }
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      scale: 1,
      backgroundColor: "rgba(96, 165, 250, 0.3)",
      borderColor: "rgba(96, 165, 250, 0.8)",
    },
    hover: {
      scale: 1.5,
      backgroundColor: "rgba(96, 165, 250, 0.6)",
      borderColor: "rgba(96, 165, 250, 1)",
    },
  };

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-blue-400 pointer-events-none z-[9999] mix-blend-difference"
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
        <motion.div
          className="absolute inset-1 rounded-full bg-blue-400"
          animate={cursorVariant}
          variants={{
            default: { scale: 0.5, opacity: 0.5 },
            hover: { scale: 0.8, opacity: 0.8 },
          }}
          transition={{ duration: 0.2 }}
        />
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