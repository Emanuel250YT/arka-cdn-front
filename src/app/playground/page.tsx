"use client";

import { useState, useEffect } from "react";
import { BackgroundEffects } from "@/components/landing/BackgroundEffects";
import { Header } from "@/components/landing/Header";
import { TryItNow } from "@/components/playground/TryItNow";
import { RealTimeExplorer } from "@/components/playground/RealTimeExplorer";
import { ArkaCDNClient } from "@/lib/arka-cdn-client";
import { Loader2 } from "lucide-react";

export default function PlaygroundPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateTestProfile = async () => {
      try {
        const email = process.env.NEXT_PUBLIC_TEST_EMAIL;
        const password = process.env.NEXT_PUBLIC_TEST_PASSWORD;
        const username = process.env.NEXT_PUBLIC_TEST_USERNAME;

        if (!email || !password || !username) {
          throw new Error('Las credenciales de test no están configuradas. Por favor, configure las variables de entorno NEXT_PUBLIC_TEST_EMAIL, NEXT_PUBLIC_TEST_PASSWORD y NEXT_PUBLIC_TEST_USERNAME.');
        }

        const client = new ArkaCDNClient(undefined, 'test');
        
        try {
          await client.login(email, password);
        } catch {
          await client.register(email, password, username);
          await client.login(email, password);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al autenticar el perfil de test');
        setIsLoading(false);
      }
    };

    authenticateTestProfile();
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(107, 33, 168, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #0a0a0a 0%, #0d0d0d 30%, #0f0f0f 55%, #0b0b0b 75%, #0a0a0a 100%)
          `,
        }}
      >
        <BackgroundEffects />
        <div className="relative z-10 text-center space-y-6 px-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Cargando perfil de test...
            </h2>
            <p className="text-sm sm:text-base text-purple-300/70">
              Autenticando y preparando el playground
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(107, 33, 168, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #0a0a0a 0%, #0d0d0d 30%, #0f0f0f 55%, #0b0b0b 75%, #0a0a0a 100%)
          `,
        }}
      >
        <BackgroundEffects />
        <div className="relative z-10 text-center space-y-6 px-4 max-w-2xl">
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">
              Error al cargar el playground
            </h2>
            <p className="text-sm sm:text-base text-red-200/80 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-700/50 hover:bg-red-700/70 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8"
        style={{
          width: "100%",
          maxWidth: "1400px",
        }}
      >
        <Header />
        
        <section className="py-8 sm:py-12 lg:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-purple-500">[</span>
              <p className="text-gray-200 font-medium text-sm sm:text-base">Playground interactivo</p>
              <span className="text-purple-500">]</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem] font-semibold text-white px-4"
              style={{ lineHeight: "1.1" }}
            >
              Prueba Arka CDN
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
                style={{ letterSpacing: "-0.02em" }}
              >
                en tiempo real
              </span>
            </h1>

            <p
              className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto px-4"
              style={{ lineHeight: "1.7" }}
            >
              Sube archivos, explora transacciones blockchain y experimenta con el almacenamiento
              descentralizado más rápido del mundo. Todo sin costo.
            </p>
          </div>
        </section>

        <TryItNow />
        <RealTimeExplorer />
      </div>
    </div>
  );
}
