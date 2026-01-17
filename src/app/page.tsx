import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturedSports,
  HowItWorks,
  CTASection,
} from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedSports />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  );
}
