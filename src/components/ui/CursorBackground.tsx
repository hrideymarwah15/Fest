"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CursorBackgroundProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  colors?: string[];
}

const CursorBackground = ({
  children,
  className = "",
  intensity = 1,
  colors = ["#60A5FA", "#3B82F6", "#1E40AF"]
}: CursorBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Transform mouse position to background effects
  const rotateX = useTransform(springY, [0, windowSize.height], [-intensity * 5, intensity * 5]);
  const rotateY = useTransform(springX, [0, windowSize.width], [intensity * 5, -intensity * 5]);

  const gradientX = useTransform(springX, [0, windowSize.width], [-20, 20]);
  const gradientY = useTransform(springY, [0, windowSize.height], [-20, 20]);

  // Pre-calculate transforms for orbs
  const orb1X = useTransform(springX, [0, windowSize.width], [-intensity * 30, intensity * 30]);
  const orb1Y = useTransform(springY, [0, windowSize.height], [-intensity * 20, intensity * 20]);
  const orb2X = useTransform(springX, [0, windowSize.width], [intensity * 25, -intensity * 25]);
  const orb2Y = useTransform(springY, [0, windowSize.height], [intensity * 15, -intensity * 15]);

  useEffect(() => {
    setMounted(true);

    // Set window size on client side
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
        }
      };

      window.addEventListener("resize", handleResize);
      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", handleMouseMove);
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        if (container) {
          container.removeEventListener("mousemove", handleMouseMove);
        }
      };
    }
  }, [mouseX, mouseY]);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Animated Background Layers */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${gradientX}px ${gradientY}px, ${colors[0]}20 0%, transparent 50%)`,
        }}
        animate={{
          background: [
            `radial-gradient(circle at ${gradientX}px ${gradientY}px, ${colors[0]}20 0%, transparent 50%)`,
            `radial-gradient(circle at ${gradientX}px ${gradientY}px, ${colors[1]}20 0%, transparent 50%)`,
            `radial-gradient(circle at ${gradientX}px ${gradientY}px, ${colors[0]}20 0%, transparent 50%)`,
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${20 + i * 10}%`,
            top: `${30 + i * 8}%`,
          }}
          animate={{
            x: [0, intensity * 20 * (i % 2 ? 1 : -1), 0],
            y: [0, intensity * 15 * (i % 3 ? 1 : -1), 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
          x: orb1X,
          y: orb1Y,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors[2]}, ${colors[0]})`,
          x: orb2X,
          y: orb2Y,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.1, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <motion.div
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default CursorBackground;