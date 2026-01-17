"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-10" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] rounded-3xl border border-[var(--card-border)] p-8 sm:p-12 lg:p-16 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent-secondary)] rounded-full blur-[100px] opacity-10" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 text-[var(--accent-primary)] text-sm font-semibold uppercase tracking-wider mb-4"
              >
                <span className="w-8 h-0.5 bg-[var(--accent-primary)]" />
                Limited Slots Available
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6"
              >
                DON'T MISS
                <br />
                <span className="text-gradient">THE ACTION</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg"
              >
                Slots are filling up fast! Secure your spot now and be part of
                the most exciting sports fest in Delhi NCR.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/sports">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Register Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Event Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-[var(--accent-primary-dim)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    FEBRUARY 14-18, 2026
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    5 days of non-stop action and competition
                  </p>
                </div>
              </div>

              <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-[var(--accent-secondary-dim)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-8 h-8 text-[var(--accent-secondary)]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    RISHIHOOD CAMPUS
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    State-of-the-art sports facilities in Sonipat, Haryana
                  </p>
                </div>
              </div>

              {/* Countdown Placeholder */}
              <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] rounded-2xl p-6">
                <p className="text-white/80 text-sm mb-2">
                  Registration Closes In
                </p>
                <div className="flex gap-4">
                  {["25", "12", "48", "32"].map((num, i) => (
                    <div key={i} className="text-center">
                      <div className="font-display text-3xl text-white">
                        {num}
                      </div>
                      <div className="text-white/60 text-xs uppercase">
                        {["Days", "Hrs", "Min", "Sec"][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
