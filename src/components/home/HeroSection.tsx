"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Zap, Trophy, Users } from "lucide-react";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const stats = [
    { icon: Trophy, value: "15+", label: "Sports Events" },
    { icon: Users, value: "50+", label: "Colleges" },
    { icon: Zap, value: "2000+", label: "Athletes" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)]"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--accent-primary)] rounded-full blur-[200px] opacity-20" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[var(--accent-secondary)] rounded-full blur-[200px] opacity-10" />

      {/* Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[var(--accent-primary-dim)] border border-[var(--accent-primary)]/30 rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[var(--accent-primary)]">
            Registrations Open — January 2026
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-none tracking-tight mb-6"
        >
          RISHIHOOD
          <br />
          <span className="text-gradient">SPORTS FEST</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12"
        >
          The biggest inter-college sports championship in Delhi NCR. Compete,
          conquer, and claim glory across 15+ sports.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/sports">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Register Now
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary" size="lg">
              Learn More
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--accent-primary-dim)] rounded-xl mb-3">
                <stat.icon className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div className="font-display text-3xl sm:text-4xl text-white">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--text-muted)] uppercase tracking-wide">
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
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[var(--card-border)] rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
