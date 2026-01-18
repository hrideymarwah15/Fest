import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturedSports,
  HowItWorks,
  CTASection,
} from "@/components/home";
import CursorBackground from "@/components/ui/CursorBackground";
import { FadeInWhenVisible, ScrollReveal } from "@/components/ui/ScrollAnimations";

export default function Home() {
  return (
    <CursorBackground
      className="min-h-screen"
      intensity={0.5}
      colors={["#60A5FA", "#3B82F6", "#1E40AF", "#1D4ED8"]}
    >
      <main className="min-h-screen">
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
    </CursorBackground>
  );
}
