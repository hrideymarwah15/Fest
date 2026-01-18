"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useAnimations";
import { containerVariants, itemVariants } from "@/lib/animations";
import CursorBackground from "@/components/ui/CursorBackground";

const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [countdown, setCountdown] = useState({
    days: 25,
    hours: 12,
    minutes: 48,
    seconds: 32,
  });

  // Animated countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => ({
        days: prev.days,
        hours: prev.hours,
        minutes: prev.minutes,
        seconds: prev.seconds > 0 ? prev.seconds - 1 : 59,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CursorBackground
      className="py-24 bg-[var(--background)] relative overflow-hidden"
      intensity={1.0}
      colors={["#60A5FA", "#EC4899", "#8B5CF6"]}
    >
      <section className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[var(--accent-primary)] rounded-full opacity-60"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] rounded-3xl border border-[var(--card-border)] p-8 sm:p-12 lg:p-16 overflow-hidden"
        >
          {/* Enhanced Decorative Elements */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] rounded-full blur-[150px] opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent-secondary)] rounded-full blur-[100px] opacity-10"
            animate={{
              scale: [1, 0.9, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Sparkle Effects */}
          <motion.div
            className="absolute top-8 right-8"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-6 h-6 text-[var(--accent-primary)] opacity-60" />
          </motion.div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 text-[var(--accent-primary)] text-sm font-semibold uppercase tracking-wider mb-4"
              >
                <motion.span
                  className="w-8 h-0.5 bg-[var(--accent-primary)]"
                  animate={{
                    scaleX: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                Limited Slots Available
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6"
              >
                DON'T MISS
                <br />
                <motion.span
                  className="text-gradient"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    background: "linear-gradient(45deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary))",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  THE ACTION
                </motion.span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg"
              >
                Slots are filling up fast! Secure your spot now and be part of
                the most exciting sports fest in Delhi NCR.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/sports">
                    <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                      Register Now
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/contact">
                    <Button variant="secondary" size="lg">
                      Contact Us
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Event Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <motion.div
                className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 flex items-center gap-5"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(96, 165, 250, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-16 h-16 bg-[var(--accent-primary-dim)] rounded-xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="w-8 h-8 text-[var(--accent-primary)]" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    FEBRUARY 14-18, 2026
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    5 days of non-stop action and competition
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 flex items-center gap-5"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(96, 165, 250, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-16 h-16 bg-[var(--accent-secondary-dim)] rounded-xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MapPin className="w-8 h-8 text-[var(--accent-secondary)]" />
                </motion.div>
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    RISHIHOOD CAMPUS
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    State-of-the-art sports facilities in Sonipat, Haryana
                  </p>
                </div>
              </motion.div>

              {/* Animated Countdown */}
              <motion.div
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] rounded-2xl p-6 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <p className="text-white/80 text-sm mb-2 relative z-10">
                  Registration Closes In
                </p>
                <div className="flex gap-4 relative z-10">
                  {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hrs" },
                    { value: countdown.minutes, label: "Min" },
                    { value: countdown.seconds, label: "Sec" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="text-center"
                      initial={{ scale: 0 }}
                      animate={isVisible ? { scale: 1 } : {}}
                      transition={{
                        delay: 0.6 + i * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <motion.div
                        className="font-display text-3xl text-white"
                        animate={{
                          scale: item.value <= 5 ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: item.value <= 5 ? Infinity : 0,
                        }}
                      >
                        {item.value.toString().padStart(2, "0")}
                      </motion.div>
                      <div className="text-white/60 text-xs uppercase">
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
    </CursorBackground>
  );
};

export default CTASection;
