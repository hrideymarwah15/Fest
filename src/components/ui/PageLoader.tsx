"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 400);
    const exitTimer = setTimeout(() => setIsLoading(false), 2200);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <motion.rect
                width="100%"
                height="100%"
                fill="url(#grid)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </div>

          {/* Radiating circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-[var(--accent-primary)]"
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{
                  width: [0, 600 + i * 200],
                  height: [0, 600 + i * 200],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>

          {/* Corner accents - Top Left */}
          <motion.svg
            className="absolute top-0 left-0 w-32 h-32 text-[var(--accent-primary)]"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.path
              d="M0 50 L0 0 L50 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.path
              d="M0 30 L0 0 L30 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </motion.svg>

          {/* Corner accents - Top Right */}
          <motion.svg
            className="absolute top-0 right-0 w-32 h-32 text-[var(--accent-primary)]"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.path
              d="M50 0 L100 0 L100 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.svg>

          {/* Corner accents - Bottom Left */}
          <motion.svg
            className="absolute bottom-0 left-0 w-32 h-32 text-[var(--accent-primary)]"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.path
              d="M0 50 L0 100 L50 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.svg>

          {/* Corner accents - Bottom Right */}
          <motion.svg
            className="absolute bottom-0 right-0 w-32 h-32 text-[var(--accent-primary)]"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.path
              d="M50 100 L100 100 L100 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.svg>

          {/* Diagonal speed lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent"
              style={{
                width: "150%",
                top: `${20 + i * 15}%`,
                transform: "rotate(-15deg)",
                transformOrigin: "left center",
              }}
              initial={{ x: "-150%", opacity: 0 }}
              animate={{ x: "50%", opacity: [0, 0.5, 0] }}
              transition={{
                duration: 1,
                delay: 0.2 + i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Center content */}
          <div className="relative flex flex-col items-center z-10">
            {/* Hexagon frame behind text */}
            <motion.svg
              className="absolute -z-10 text-[var(--accent-primary)]"
              width="280"
              height="280"
              viewBox="0 0 100 100"
              initial={{ opacity: 0, rotate: -30 }}
              animate={{ opacity: 0.15, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </motion.svg>

            {/* Main title */}
            <motion.h1
              className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-tight text-center"
              initial={{ scale: 2.5, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
            >
              RISHIHOOD
            </motion.h1>

            {/* Subtitle */}
            {showText && (
              <motion.div
                className="mt-3 overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <motion.p
                  className="font-display text-2xl sm:text-3xl md:text-4xl text-[var(--accent-primary)] tracking-[0.2em]"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  SPORTS FEST
                </motion.p>
              </motion.div>
            )}

            {/* Decorative line under text */}
            {showText && (
              <motion.div
                className="mt-4 flex items-center gap-2"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--accent-primary)]" />
                <span className="text-sm text-[var(--text-muted)] tracking-[0.3em]">2026</span>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--accent-primary)]" />
              </motion.div>
            )}
          </div>

          {/* Bottom progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--card-border)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-secondary)] via-[var(--accent-primary)] to-[var(--accent-secondary)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
