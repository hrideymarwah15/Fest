"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { ArrowRight, Users, User, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useAnimations";
import { containerVariants, itemVariants, cardVariants } from "@/lib/animations";

// Featured sports data (in production, this would come from the database)
const featuredSports = [
  {
    id: "1",
    name: "Football",
    slug: "football",
    type: "TEAM" as const,
    maxSlots: 32,
    filledSlots: 24,
    fee: 2000,
    image: "/images/sports/football.jpg",
    eventDate: "Feb 15, 2026",
  },
  {
    id: "2",
    name: "Basketball",
    slug: "basketball",
    type: "TEAM" as const,
    maxSlots: 24,
    filledSlots: 18,
    fee: 1500,
    image: "/images/sports/basketball.jpg",
    eventDate: "Feb 16, 2026",
  },
  {
    id: "3",
    name: "Badminton",
    slug: "badminton",
    type: "INDIVIDUAL" as const,
    maxSlots: 64,
    filledSlots: 45,
    fee: 500,
    image: "/images/sports/badminton.jpg",
    eventDate: "Feb 14, 2026",
  },
  {
    id: "4",
    name: "Cricket",
    slug: "cricket",
    type: "TEAM" as const,
    maxSlots: 16,
    filledSlots: 14,
    fee: 3000,
    image: "/images/sports/cricket.jpg",
    eventDate: "Feb 17-18, 2026",
  },
];

const FeaturedSports = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-5"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <motion.span
              className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2 block"
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Featured Events
            </motion.span>
            <motion.h2
              className="font-display text-4xl sm:text-5xl text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              POPULAR SPORTS
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/sports">
              <Button variant="ghost" size="sm" className="group">
                View All Sports
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Sports Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredSports.map((sport, index) => (
            <motion.div
              key={sport.id}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              data-sport={sport.slug}
            >
              <Link href={`/sports/${sport.slug}`}>
                <Card glow className="h-full group overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--card-border)] to-[var(--card-bg)] overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent z-10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute top-4 left-4 z-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    >
                      <Badge variant={sport.type === "TEAM" ? "team" : "individual"}>
                        {sport.type === "TEAM" ? (
                          <Users className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {sport.type}
                      </Badge>
                    </motion.div>
                    {/* Animated Sport Icon */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.span
                        className="font-display text-6xl text-white/10 group-hover:text-[var(--accent-primary)]/20 transition-colors"
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {sport.name.slice(0, 2).toUpperCase()}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.div
                    className="p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <motion.h3
                      className="font-display text-xl text-white mb-2 group-hover:text-[var(--accent-primary)] transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {sport.name.toUpperCase()}
                    </motion.h3>

                    <motion.div
                      className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Clock className="w-4 h-4" />
                      {sport.eventDate}
                    </motion.div>

                    {/* Animated Slots Progress */}
                    <div className="mb-4">
                      <motion.div
                        className="flex justify-between text-xs mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <span className="text-[var(--text-secondary)]">
                          Slots Filled
                        </span>
                        <span className="text-[var(--accent-primary)] font-semibold">
                          {sport.filledSlots}/{sport.maxSlots}
                        </span>
                      </motion.div>
                      <div className="h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={
                            isVisible
                              ? {
                                  width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            delay: 0.6 + index * 0.1,
                            ease: "easeOut",
                          }}
                          className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Animated Fee */}
                    <motion.div
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <motion.span
                        className="text-2xl font-bold text-white"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        ₹{sport.fee}
                      </motion.span>
                      <span className="text-xs text-[var(--text-muted)]">
                        per {sport.type === "TEAM" ? "team" : "player"}
                      </span>
                    </motion.div>
                  </motion.div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedSports;
