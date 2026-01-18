"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui";
import { Users, User, Clock, MapPin, Search, Filter, ArrowRight, Loader2 } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: "TEAM" | "INDIVIDUAL";
  gender?: "MEN" | "WOMEN" | "MIXED" | "OPEN";
  minTeamSize: number;
  maxTeamSize: number;
  maxSlots: number;
  filledSlots: number;
  fee: number;
  eventDate: string | null;
  venue: string | null;
  registrationOpen: boolean;
}

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INDIVIDUAL" | "TEAM">("ALL");

  // Fetch sports from API
  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch("/api/sports");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Failed to fetch sports" }));
          throw new Error(errorData.message || "Failed to fetch sports");
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSports(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Sports fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load sports. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSports();
  }, []);

  const filteredSports = sports.filter((sport) => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || sport.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) return "TBA";
      
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "TBA";
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2 block">
              Choose Your Arena
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-4">
              ALL SPORTS
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
              Browse through our sports events and register for the ones that
              match your skills. Show them what you&apos;re made of.
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
            <div className="flex gap-2">
              {(["ALL", "TEAM", "INDIVIDUAL"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${filterType === type
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--card-border)] hover:border-[var(--accent-primary)]"
                    }`}
                >
                  {type === "ALL" && <Filter className="w-4 h-4 inline mr-2" />}
                  {type === "ALL" ? "All" : type === "TEAM" ? "Team" : "Individual"}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
              <span className="ml-3 text-[var(--text-secondary)]">Loading sports...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">{error}</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Sports Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSports.map((sport, index) => (
                <motion.div
                  key={sport.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link href={`/sports/${sport.slug}`}>
                    <Card glow className="h-full group">
                      {/* Header */}
                      <div className="relative h-40 bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--card-bg)] overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-7xl text-white/5 group-hover:text-[var(--accent-primary)]/10 transition-colors">
                            {sport.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[70%]">
                          <Badge variant={sport.type === "TEAM" ? "team" : "individual"}>
                            {sport.type === "TEAM" ? (
                              <Users className="w-3 h-3 mr-1" />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            {sport.type}
                          </Badge>
                          {sport.gender && sport.gender !== "OPEN" && (
                            <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-white/20 text-white">
                              {sport.gender}
                            </Badge>
                          )}
                        </div>
                        {sport.filledSlots >= sport.maxSlots * 0.9 && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="warning">Almost Full</Badge>
                          </div>
                        )}
                        {!sport.registrationOpen && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="error">Closed</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-display text-2xl text-white mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                          {sport.name.toUpperCase()}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                          {sport.description}
                        </p>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Clock className="w-4 h-4" />
                            {formatEventDate(sport.eventDate)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <MapPin className="w-4 h-4" />
                            {sport.venue || "TBA"}
                          </div>
                          {sport.type === "TEAM" && (
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                              <Users className="w-4 h-4" />
                              {sport.minTeamSize}-{sport.maxTeamSize} players per team
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--text-secondary)]">
                              Slots Available
                            </span>
                            <span className="text-[var(--accent-primary)] font-semibold">
                              {sport.maxSlots - sport.filledSlots} left
                            </span>
                          </div>
                          <div className="h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                              style={{
                                width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
                          <div>
                            <span className="text-2xl font-bold text-white">
                              ₹{sport.fee}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] ml-1">
                              / {sport.type === "TEAM" ? "team" : "player"}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="group-hover:bg-[var(--accent-primary-hover)]"
                            disabled={!sport.registrationOpen}
                          >
                            {sport.registrationOpen ? "Register" : "Closed"}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && !error && filteredSports.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-[var(--text-muted)] text-lg">
                No sports found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
