"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Zap, Trophy, Users } from "lucide-react";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { icon: Trophy, value: "15+", label: "Sports Events" },
    { icon: Users, value: "50+", label: "Colleges" },
    { icon: Zap, value: "2000+", label: "Athletes" },
  ];

  return (
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050508]"
      >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#050508] to-[#080810]" />

      {/* Animated mesh gradient with blue, orange, red */}
      <div className="absolute inset-0 opacity-50">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 50% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse 80% 50% at 80% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 60%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 50% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      </div>

      {/* SVG Sports Icons Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sports-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Basketball */}
              <circle cx="30" cy="30" r="12" fill="none" stroke="white" strokeWidth="1" />
              <path d="M18 30 Q30 25 42 30 M18 30 Q30 35 42 30" fill="none" stroke="white" strokeWidth="0.5" />
              <line x1="30" y1="18" x2="30" y2="42" stroke="white" strokeWidth="0.5" />

              {/* Football/Soccer */}
              <circle cx="90" cy="30" r="12" fill="none" stroke="white" strokeWidth="1" />
              <polygon points="90,20 96,26 94,34 86,34 84,26" fill="none" stroke="white" strokeWidth="0.5" />

              {/* Trophy */}
              <path d="M55 75 L55 85 L50 90 L70 90 L65 85 L65 75 Z" fill="none" stroke="white" strokeWidth="0.8" />
              <path d="M52 75 Q52 65 60 65 Q68 65 68 75" fill="none" stroke="white" strokeWidth="0.8" />

              {/* Running figure */}
              <circle cx="30" cy="95" r="4" fill="none" stroke="white" strokeWidth="0.8" />
              <path d="M30 99 L30 108 M26 104 L34 104 M30 108 L25 118 M30 108 L35 118" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sports-pattern)" />
        </svg>
      </div>

      {/* Geometric lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="60%" stopColor="rgba(249, 115, 22, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(239, 68, 68, 0.3)" />
            <stop offset="80%" stopColor="rgba(249, 115, 22, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Diagonal lines */}
        <motion.line
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.line
          x1="20%"
          y1="100%"
          x2="100%"
          y2="20%"
          stroke="url(#line-gradient-2)"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
      </svg>

      {/* Floating orbs with parallax - Blue, Orange, Red */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
          filter: "blur(40px)",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 70%)",
          x: mousePosition.x * -0.3,
          y: mousePosition.y * -0.3,
          filter: "blur(60px)",
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
          x: mousePosition.x * 0.2,
          y: mousePosition.y * -0.2,
          filter: "blur(50px)",
        }}
      />

      {/* Corner accent shapes */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <motion.path
            d="M600 0 L600 300 L450 150 Z"
            fill="none"
            stroke="rgba(96, 165, 250, 0.5)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <motion.path
            d="M600 0 L600 200 L500 100 Z"
            fill="rgba(96, 165, 250, 0.03)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <motion.path
            d="M0 500 L0 250 L125 375 Z"
            fill="none"
            stroke="rgba(96, 165, 250, 0.5)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />
        </svg>
      </motion.div>

      {/* Animated horizontal lines */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          {[15, 35, 55, 75, 90].map((top, i) => (
            <motion.div
              key={i}
              className="absolute left-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
              style={{ top: `${top}%`, width: "100%" }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "100%", opacity: [0, 0.5, 0] }}
              transition={{
                duration: 4 + i,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2.5 mb-10 backdrop-blur-sm"
        >
          <motion.span
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-medium text-blue-400 tracking-wide">
            Registrations Open — January 2026
          </span>
        </motion.div>

        {/* Main Heading */}
        <div className="relative mb-8">
          {/* Background text shadow effect */}
          <motion.h1
            className="absolute inset-0 font-display text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-blue-500/5 leading-none tracking-tight select-none blur-sm"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            RISHIHOOD
          </motion.h1>

          <motion.h1
            className="relative font-display text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] text-white leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            RISHIHOOD
          </motion.h1>
        </div>

        <motion.h2
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            SPORTS FEST
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          The biggest inter-college sports championship in Delhi NCR. Compete,
          conquer, and claim glory across 15+ sports.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/sports">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Register Now
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="text-center group"
            >
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 group-hover:bg-blue-500/20 transition-colors duration-300"
                whileHover={{ rotate: 5 }}
              >
                <stat.icon className="w-6 h-6 text-blue-400" />
              </motion.div>
              <div className="font-display text-3xl sm:text-4xl text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="w-6 h-10 border-2 border-gray-700 rounded-full flex items-start justify-center p-2 cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent" />
    </section>
  );
};

export default HeroSection;
