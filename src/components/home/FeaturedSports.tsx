"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { ArrowRight, Users, User, Clock } from "lucide-react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-[var(--background)] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-5" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2 block">
              Featured Events
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-white">
              POPULAR SPORTS
            </h2>
          </div>
          <Link href="/sports">
            <Button variant="ghost" size="sm">
              View All Sports
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Sports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSports.map((sport, index) => (
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/sports/${sport.slug}`}>
                <Card glow className="h-full group">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--card-border)] to-[var(--card-bg)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20">
                      <Badge variant={sport.type === "TEAM" ? "team" : "individual"}>
                        {sport.type === "TEAM" ? (
                          <Users className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {sport.type}
                      </Badge>
                    </div>
                    {/* Sport Icon Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-6xl text-white/10 group-hover:text-[var(--accent-primary)]/20 transition-colors">
                        {sport.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-xl text-white mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                      {sport.name.toUpperCase()}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
                      <Clock className="w-4 h-4" />
                      {sport.eventDate}
                    </div>

                    {/* Slots Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-secondary)]">
                          Slots Filled
                        </span>
                        <span className="text-[var(--accent-primary)] font-semibold">
                          {sport.filledSlots}/{sport.maxSlots}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={
                            isInView
                              ? {
                                  width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                                }
                              : {}
                          }
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="h-full bg-[var(--accent-primary)] rounded-full"
                        />
                      </div>
                    </div>

                    {/* Fee */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        ₹{sport.fee}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        per {sport.type === "TEAM" ? "team" : "player"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSports;
