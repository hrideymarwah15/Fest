"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { Trophy, Users, Target, Calendar, Award, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
              ABOUT RISHIHOOD
              <br />
              <span className="text-[var(--accent-primary)]">SPORTS FEST 2026</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-3xl mx-auto">
              Bringing together the brightest minds and strongest athletes for an
              unforgettable celebration of sport, competition, and camaraderie.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: Trophy, label: "Sports", value: "15+" },
              { icon: Users, label: "Participants", value: "500+" },
              { icon: Calendar, label: "Days", value: "3" },
              { icon: Award, label: "Prize Pool", value: "₹1L+" },
            ].map((stat, index) => (
              <Card key={index} hover={false} className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-[var(--accent-primary)] mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[var(--text-muted)] text-sm">{stat.label}</p>
              </Card>
            ))}
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 h-full">
                <Target className="w-12 h-12 text-[var(--accent-primary)] mb-4" />
                <h2 className="font-display text-2xl text-white mb-4">OUR MISSION</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  To create a platform that celebrates athletic excellence, fosters
                  healthy competition, and builds lasting connections between colleges
                  across the region. We believe in the power of sports to unite,
                  inspire, and transform.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 h-full">
                <Heart className="w-12 h-12 text-[var(--accent-primary)] mb-4" />
                <h2 className="font-display text-2xl text-white mb-4">OUR VISION</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  To become the premier inter-college sports festival in the region,
                  known for its professionalism, inclusivity, and the unforgettable
                  experiences it creates. We aim to inspire the next generation of
                  athletes and leaders.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl text-white text-center mb-8">
              WHAT WE OFFER
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Diverse Sports",
                  description:
                    "From cricket and football to chess and badminton, we offer 15+ sports across individual and team categories.",
                },
                {
                  title: "Professional Organization",
                  description:
                    "State-of-the-art facilities, qualified referees, and seamless event management ensure a world-class experience.",
                },
                {
                  title: "Networking Opportunities",
                  description:
                    "Connect with athletes, coaches, and sports enthusiasts from colleges across the region.",
                },
                {
                  title: "Prizes & Recognition",
                  description:
                    "Substantial prize money, trophies, and certificates for winners and participants.",
                },
                {
                  title: "Cultural Events",
                  description:
                    "Evening cultural programs, music, and entertainment to complement the sporting action.",
                },
                {
                  title: "Inclusivity",
                  description:
                    "Events designed for all skill levels, ensuring everyone can participate and enjoy.",
                },
              ].map((item, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-display text-xl text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Card className="p-12 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent border-[var(--accent-primary)]/30">
              <h2 className="font-display text-3xl text-white mb-4">
                READY TO JOIN US?
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                Register now and be part of the most exciting sports festival of
                the year. Don't miss out on the action!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sports">
                  <Button size="lg">Browse Sports</Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="secondary">Contact Us</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
