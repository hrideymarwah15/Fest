"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface FloatingElementsProps {
  count?: number;
  colors?: string[];
  size?: number;
}

const FloatingElements = ({
  count = 12,
  colors = ["#60A5FA", "#3B82F6", "#8B5CF6", "#EC4899"],
  size = 4
}: FloatingElementsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const delay = i * 0.5;
        const duration = 3 + (i % 3);
        const color = colors[i % colors.length];

        return (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              width: size + (i % 3) * 2,
              height: size + (i % 3) * 2,
              backgroundColor: color,
              left: `${10 + (i * 7) % 80}%`,
              top: `${20 + (i * 11) % 60}%`,
            }}
            animate={{
              x: [0, 20, -10, 0],
              y: [0, -15, 25, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.8, 0.4, 0.3],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 2,
              opacity: 1,
              transition: { duration: 0.3 },
            }}
          />
        );
      })}

      {/* Interactive cursor-following elements */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`follower-${i}`}
          className="absolute rounded-full opacity-40 blur-sm"
          style={{
            width: 20 + i * 10,
            height: 20 + i * 10,
            backgroundColor: colors[i % colors.length],
            x: useTransform(springX, (x) => x - 10 - i * 5),
            y: useTransform(springY, (y) => y - 10 - i * 5),
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;