"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "rotate" | "parallax";
  delay?: number;
}

export const ScrollAnimation = ({
  children,
  className = "",
  animation = "fade",
  delay = 0,
}: ScrollAnimationProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const animations = {
    fade: {
      opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.8]),
    },
    slide: {
      opacity: useTransform(scrollYProgress, [0, 0.3], [0, 1]),
      y: useTransform(scrollYProgress, [0, 0.3], [100, 0]),
    },
    scale: {
      opacity: useTransform(scrollYProgress, [0, 0.3], [0, 1]),
      scale: useTransform(scrollYProgress, [0, 0.3], [0.8, 1]),
    },
    rotate: {
      opacity: useTransform(scrollYProgress, [0, 0.3], [0, 1]),
      rotate: useTransform(scrollYProgress, [0, 0.3], [-15, 0]),
    },
    parallax: {
      y: useTransform(scrollYProgress, [0, 1], [0, -100]),
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={animations[animation]}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
};

export const ParallaxSection = ({
  children,
  speed = 0.5,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div ref={ref} className={className} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
};

export const FadeInWhenVisible = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const directionVariants = {
    up: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={directionVariants[direction].initial}
      animate={isVisible ? directionVariants[direction].animate : directionVariants[direction].initial}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerChildren = ({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;