'use client';

import { Sparkles, Zap, Globe, Shield } from 'lucide-react';

export const PlaygroundHero = () => {
  return (
    <section className="py-16 lg:py-24 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/40 rounded-full text-sm mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">Interactive Playground</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
          Prueba Arka CDN
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-violet-400">
            en tiempo real
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-blue-200 leading-relaxed max-w-3xl mx-auto">
          Sube archivos, explora transacciones blockchain y experimenta con el almacenamiento
          descentralizado más rápido del mundo.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
            <Zap className="w-6 h-6 text-blue-400" />
            <p className="text-sm font-medium text-white">Rápido</p>
            <p className="text-xs text-blue-300">Subida instantánea</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
            <Globe className="w-6 h-6 text-blue-400" />
            <p className="text-sm font-medium text-white">Global</p>
            <p className="text-xs text-blue-300">Distribución CDN</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
            <Shield className="w-6 h-6 text-blue-400" />
            <p className="text-sm font-medium text-white">Seguro</p>
            <p className="text-xs text-blue-300">Blockchain</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <p className="text-sm font-medium text-white">Gratis</p>
            <p className="text-xs text-blue-300">Sin costo</p>
          </div>
        </div>
      </div>
    </section>
  );
};

