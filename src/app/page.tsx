import { BackgroundEffects } from "@/components/landing/BackgroundEffects";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

export default function HomePage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%)",
      }}
    >
      <BackgroundEffects />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <Header />
        <HeroSection />
        <FeaturesSection />
      </div>
    </div>
  );
}
