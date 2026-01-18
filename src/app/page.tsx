import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturedSports,
  HowItWorks,
  CTASection,
} from "@/components/home";
import { FadeInWhenVisible, ScrollReveal } from "@/components/ui/ScrollAnimations";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <HeroSection />

      <FadeInWhenVisible>
        <FeaturedSports />
      </FadeInWhenVisible>

      <ScrollReveal direction="left" delay={0.2}>
        <HowItWorks />
      </ScrollReveal>

      <FadeInWhenVisible delay={0.3}>
        <CTASection />
      </FadeInWhenVisible>

      <Footer />
    </main>
  );
}
