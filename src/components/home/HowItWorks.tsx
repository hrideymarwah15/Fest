"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, CreditCard, Trophy, CheckCircle } from "lucide-react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-[var(--card-bg)] relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2 block">
            Simple Process
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Register for your favorite sports in just a few simple steps.
            No hassle, no paperwork — just pure competition.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--card-border)] to-[var(--accent-primary)]" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + index * 0.15,
                  type: "spring",
                }}
                className="relative z-10 w-32 h-32 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-[var(--accent-primary-dim)] rounded-2xl rotate-6" />
                <div className="relative w-full h-full bg-[var(--background)] rounded-2xl border border-[var(--card-border)] flex items-center justify-center">
                  <step.icon className="w-12 h-12 text-[var(--accent-primary)]" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                  <span className="font-bold text-white text-sm">
                    {index + 1}
                  </span>
                </div>
              </motion.div>

              {/* Content */}
              <h3 className="font-display text-xl text-white mb-3">
                {step.title.toUpperCase()}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
