"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Badge, Accordion, Card } from "@/components/ui";
import {
  Users,
  User,
  Clock,
  MapPin,
  Trophy,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: any;
  type: "TEAM" | "INDIVIDUAL";
  minTeamSize: number;
  maxTeamSize: number;
  maxSlots: number;
  filledSlots: number;
  fee: number;
  prizes: any;
  imageUrl: string | null;
  icon: string | null;
  isActive: boolean;
  registrationOpen: boolean;
  eventDate: string | null;
  venue: string | null;
}

// Sample data for fallback (in production this comes from API)
const sportsDataFallback: Record<string, any> = {
  football: {
    id: "1",
    name: "Football",
    slug: "football",
    description:
      "Experience the thrill of 11-a-side football at its finest. Our tournament features knockout rounds starting from the quarter-finals, with matches played on our world-class synthetic turf ground. This is your chance to showcase your team's skills and compete against the best college teams in Delhi NCR.",
    rules: [
      "Each team must have 11 players on the field at any time",
      "Match duration: 2 halves of 30 minutes each with 5 minutes half-time",
      "Substitutions: Maximum 5 substitutions allowed per match",
      "Yellow and red card rules as per FIFA regulations apply",
      "In case of a draw, penalty shootout will decide the winner",
      "Team captain must attend the pre-match briefing",
      "All players must wear proper football attire including shin guards",
    ],
    type: "TEAM",
    minTeamSize: 11,
    maxTeamSize: 15,
    maxSlots: 32,
    filledSlots: 24,
    fee: 2000,
    eventDate: "February 15-16, 2026",
    venue: "Main Football Ground",
    registrationOpen: true,
    prizes: {
      first: "₹50,000 + Trophy",
      second: "₹25,000 + Trophy",
      third: "₹10,000",
    },
  },
  basketball: {
    id: "2",
    name: "Basketball",
    slug: "basketball",
    description:
      "Fast-paced 5-a-side basketball action awaits you! Compete on our indoor court with professional-grade flooring and NBA-standard hoops. Show off your dribbling, shooting, and teamwork skills in this high-energy tournament.",
    rules: [
      "5 players per team on court at any time",
      "Match duration: 4 quarters of 8 minutes each",
      "Shot clock: 24 seconds",
      "Timeouts: 2 per half",
      "Overtime: 3 minutes if tied at regulation",
      "FIBA rules apply for all technical aspects",
    ],
    type: "TEAM",
    minTeamSize: 5,
    maxTeamSize: 8,
    maxSlots: 24,
    filledSlots: 18,
    fee: 1500,
    eventDate: "February 16, 2026",
    venue: "Indoor Basketball Court",
    registrationOpen: true,
    prizes: {
      first: "₹30,000 + Trophy",
      second: "₹15,000 + Trophy",
      third: "₹7,500",
    },
  },
  "badminton-singles": {
    id: "3",
    name: "Badminton Singles",
    slug: "badminton-singles",
    description:
      "Test your agility and precision in our singles badminton tournament. Compete in our air-conditioned indoor stadium with professional BWF-approved courts and equipment.",
    rules: [
      "Best of 3 games format",
      "21 points per game",
      "Rally scoring system",
      "2 minutes rest between games",
      "BWF rules apply for all aspects",
      "Shuttlecocks provided by organizers",
    ],
    type: "INDIVIDUAL",
    minTeamSize: 1,
    maxTeamSize: 1,
    maxSlots: 64,
    filledSlots: 45,
    fee: 500,
    eventDate: "February 14, 2026",
    venue: "Indoor Stadium",
    registrationOpen: true,
    prizes: {
      first: "₹15,000 + Trophy",
      second: "₹7,500 + Trophy",
      third: "₹3,000",
    },
  },
  cricket: {
    id: "4",
    name: "Cricket",
    slug: "cricket",
    description:
      "The gentleman's game in its most exciting format - T20! Bring your A-game to our well-maintained cricket ground and compete for glory in this high-stakes tournament.",
    rules: [
      "20 overs per side",
      "Maximum 4 overs per bowler",
      "Powerplay: 6 overs with fielding restrictions",
      "ICC T20 rules apply",
      "DRS not available",
      "Super Over in case of tie",
      "White ball cricket",
    ],
    type: "TEAM",
    minTeamSize: 11,
    maxTeamSize: 15,
    maxSlots: 16,
    filledSlots: 14,
    fee: 3000,
    eventDate: "February 17-18, 2026",
    venue: "Cricket Ground",
    registrationOpen: true,
    prizes: {
      first: "₹75,000 + Trophy",
      second: "₹35,000 + Trophy",
      third: "₹15,000",
    },
  },
};

export default function SportDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sport, setSport] = useState<Sport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sport from API
  useEffect(() => {
    async function fetchSport() {
      try {
        const res = await fetch(`/api/sports/${slug}`);
        if (!res.ok) {
          throw new Error("Sport not found");
        }
        const data = await res.json();
        setSport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sport");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSport();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
          <span className="ml-3 text-[var(--text-secondary)]">Loading sport details...</span>
        </div>
        <Footer />
      </main>
    );
  }

  // Error or not found
  if (!sport || error) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <h1 className="font-display text-4xl text-white mb-4">Sport Not Found</h1>
          <Link href="/sports">
            <Button variant="secondary">Back to Sports</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const slotsRemaining = sport.maxSlots - sport.filledSlots;
  const isAlmostFull = slotsRemaining <= sport.maxSlots * 0.1;

  // Parse rules if it's a JSON object or array
  let rulesArray: string[] = [];
  if (typeof sport.rules === 'string') {
    try {
      const parsed = JSON.parse(sport.rules);
      rulesArray = Array.isArray(parsed) ? parsed : [sport.rules];
    } catch {
      rulesArray = [sport.rules];
    }
  } else if (Array.isArray(sport.rules)) {
    rulesArray = sport.rules;
  } else if (sport.rules && typeof sport.rules === 'object') {
    rulesArray = Object.values(sport.rules);
  }

  // Parse prizes
  let prizesData: any = { first: "TBA", second: "TBA", third: "TBA" };
  if (sport.prizes) {
    if (typeof sport.prizes === 'string') {
      try {
        prizesData = JSON.parse(sport.prizes);
      } catch {
        prizesData = { first: sport.prizes, second: "TBA", third: "TBA" };
      }
    } else {
      prizesData = sport.prizes;
    }
  }

  // Format event date
  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-primary)] rounded-full blur-[300px] opacity-15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/sports">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sports
              </Button>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={sport.type === "TEAM" ? "team" : "individual"}>
                  {sport.type === "TEAM" ? (
                    <Users className="w-3 h-3 mr-1" />
                  ) : (
                    <User className="w-3 h-3 mr-1" />
                  )}
                  {sport.type} Sport
                </Badge>
                {isAlmostFull && <Badge variant="warning">Almost Full!</Badge>}
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6">
                {sport.name.toUpperCase()}
              </h1>

              <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
                {sport.description}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                  <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Date</p>
                    <p className="text-white font-medium">{formatEventDate(sport.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                  <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Venue</p>
                    <p className="text-white font-medium">{sport.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                  <Users className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Team Size</p>
                    <p className="text-white font-medium">
                      {sport.type === "TEAM"
                        ? `${sport.minTeamSize}-${sport.maxTeamSize} players`
                        : "Individual"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                  <DollarSign className="w-5 h-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Entry Fee</p>
                    <p className="text-white font-medium">
                      ₹{sport.fee} / {sport.type === "TEAM" ? "team" : "player"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/register/${sport.slug}`} className="flex-1">
                  <Button size="lg" className="w-full">
                    Register Now
                    <Trophy className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="secondary" size="lg">
                  Download Rules PDF
                </Button>
              </div>
            </motion.div>

            {/* Right Content - Registration Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card hover={false} className="sticky top-24">
                <div className="p-6">
                  {/* Slots Status */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-secondary)]">
                        Registration Status
                      </span>
                      {sport.registrationOpen ? (
                        <span className="flex items-center gap-1 text-blue-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Closed
                        </span>
                      )}
                    </div>
                    <div className="h-3 bg-[var(--card-border)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(sport.filledSlots / sport.maxSlots) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          isAlmostFull
                            ? "bg-blue-300"
                            : "bg-[var(--accent-primary)]"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-[var(--accent-primary)] font-semibold">
                        {slotsRemaining} slots remaining
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {sport.filledSlots}/{sport.maxSlots} filled
                      </span>
                    </div>
                  </div>

                  {/* Prize Pool */}
                  <div className="mb-6">
                    <h3 className="font-display text-lg text-white mb-4">
                      PRIZE POOL
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-lg border border-yellow-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">1</span>
                          </div>
                          <span className="text-white">1st Place</span>
                        </div>
                        <span className="text-yellow-400 font-bold">
                          {prizesData.first}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-400/20 to-transparent rounded-lg border border-gray-400/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">2</span>
                          </div>
                          <span className="text-white">2nd Place</span>
                        </div>
                        <span className="text-gray-300 font-bold">
                          {prizesData.second}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-700/20 to-transparent rounded-lg border border-blue-700/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <span className="text-white">3rd Place</span>
                        </div>
                        <span className="text-blue-600 font-bold">
                          {prizesData.third}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Entry Fee Highlight */}
                  <div className="p-4 bg-[var(--accent-primary-dim)] rounded-xl border border-[var(--accent-primary)]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Entry Fee
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-white">
                          ₹{sport.fee}
                        </span>
                        <span className="text-[var(--text-muted)] text-sm ml-1">
                          / {sport.type === "TEAM" ? "team" : "player"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl text-white mb-8">
              RULES & REGULATIONS
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {rulesArray.map((rule: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]"
                >
                  <div className="w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{rule}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
