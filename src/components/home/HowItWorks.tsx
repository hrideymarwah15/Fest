"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, CreditCard, Trophy, CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useAnimations";
import { containerVariants, itemVariants, pathVariants } from "@/lib/animations";
import CursorBackground from "@/components/ui/CursorBackground";
import { StaggerChildren } from "@/components/ui/ScrollAnimations";
const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up with your email and complete your profile with college details.",
  },
  {
    icon: Trophy,
    title: "Choose Sports",
    description:
      "Browse available sports and select the events you want to participate in.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description:
      "Complete payment through our secure Razorpay gateway. Instant confirmation.",
  },
  {
    icon: CheckCircle,
    title: "You're Registered!",
    description:
      "Receive your confirmation and get ready to compete. See you on the field!",
  },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <CursorBackground
      className="py-24 bg-[var(--card-bg)] relative overflow-hidden"
      intensity={1.2}
      colors={["#60A5FA", "#F59E0B", "#EF4444"]}
    >
      <section className="relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)",
            backgroundSize: "200px 200px",
          }}
        />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2 block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Simple Process
          </motion.span>
          <motion.h2
            className="font-display text-4xl sm:text-5xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            HOW IT WORKS
          </motion.h2>
          <motion.p
            className="text-[var(--text-secondary)] max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Register for your favorite sports in just a few simple steps.
            No hassle, no paperwork — just pure competition.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Animated Connection Line (Desktop) */}
          <motion.div
            className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.8 }}
            style={{
              background: "linear-gradient(90deg, var(--accent-primary), var(--card-border), var(--accent-primary))",
              transformOrigin: "left",
            }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative text-center"
            >
              {/* Animated Step Number */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + index * 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="relative z-10 w-32 h-32 mx-auto mb-6 group"
              >
                <motion.div
                  className="absolute inset-0 bg-[var(--accent-primary-dim)] rounded-2xl rotate-6"
                  animate={{
                    rotate: [6, -6, 6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="relative w-full h-full bg-[var(--background)] rounded-2xl border border-[var(--card-border)] flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isVisible ? { scale: 1 } : {}}
                    transition={{
                      delay: 0.7 + index * 0.2,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <step.icon className="w-12 h-12 text-[var(--accent-primary)]" />
                  </motion.div>
                </motion.div>
                <motion.div
                  className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={isVisible ? { scale: 1 } : {}}
                  transition={{
                    delay: 0.9 + index * 0.2,
                    type: "spring",
                    stiffness: 400,
                  }}
                  whileHover={{
                    scale: 1.2,
                    backgroundColor: "var(--accent-secondary)",
                  }}
                >
                  <span className="font-bold text-white text-sm">
                    {index + 1}
                  </span>
                </motion.div>
              </motion.div>

              {/* Animated Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
              >
                <motion.h3
                  className="font-display text-xl text-white mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {step.title.toUpperCase()}
                </motion.h3>
                <motion.p
                  className="text-[var(--text-secondary)] text-sm leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                >
                  {step.description}
                </motion.p>
              </motion.div>

              {/* Animated Arrow for Desktop */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-16 -right-4 z-10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.2 + index * 0.2 }}
                >
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-0 h-0 border-l-[8px] border-l-[var(--accent-primary)] border-y-[4px] border-y-transparent"
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </CursorBackground>
  );
};

export default HowItWorks;
