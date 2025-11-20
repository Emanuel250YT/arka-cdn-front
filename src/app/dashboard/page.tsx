"use client";

import { BackgroundEffects } from "@/components/landing/BackgroundEffects";
import { Header } from "@/components/landing/Header";
import { PersonalFilesManager } from "@/components/playground/PersonalFilesManager";
import { EntityManager } from "@/components/playground/EntityManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { ArkaCDNClient } from "@/lib/arka-cdn-client";

export default function DashboardPage() {
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));

  return (
    <ProtectedRoute>
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
          
          <section className="py-12 lg:py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <div className="flex items-center justify-center gap-2">
                <span className="text-purple-500">[</span>
                <p className="text-gray-200 font-medium">Panel de control</p>
                <span className="text-purple-500">]</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-white"
                style={{ lineHeight: "1.1" }}
              >
                Gestiona tus{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  archivos
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Administra, visualiza y comparte tus archivos de forma segura con Arka CDN
              </p>
            </div>
          </section>

          <PersonalFilesManager />
          
          <section className="py-12 lg:py-20">
            <EntityManager client={client} isAuthenticated={true} />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

