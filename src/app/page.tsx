"use client";

import { BackgroundEffects } from "@/components/landing/BackgroundEffects";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

export default function HomePage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top, rgba(107, 33, 168, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.2) 0%, transparent 50%),
          linear-gradient(to bottom, #0a0a0a 0%, #0d0d0d 30%, #0f0f0f 55%, #0b0b0b 75%, #0a0a0a 100%)
        `,
      }}
    >
      <BackgroundEffects />

      <div
        className="relative z-10 mx-auto"
        style={{
          width: "92%",
          maxWidth: "1400px",
          paddingLeft: "clamp(1.5rem, 4vw, 2.5rem)",
          paddingRight: "clamp(1.5rem, 4vw, 2.5rem)",
        }}
      >
        <Header />
        <HeroSection />
        <FeaturesSection />
      </div>
    </div>
  );
}
