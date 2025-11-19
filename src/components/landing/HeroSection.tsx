import Link from "next/link";
import { FloatingCards } from "./FloatingCard";

export const HeroSection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/40 rounded-full text-sm">
            <span className="text-blue-400">[ 150+ organizations ]</span>
          </div>

          <h1 className="text-[3.6rem] font-bold text-white leading-tight">
            Entrega de Contenido Descentralizada a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500">
              Velocidad Relámpago
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-blue-200 leading-relaxed max-w-lg">
            Almacenamiento descentralizado en Arkiv Network con entrega global
            mediante Cloudflare. Paga solo por escrituras, no por lecturas ni
            ancho de banda.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 flex items-center gap-2">
              Comienza gratis
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/api-docs" className="group px-8 py-4 text-white rounded-xl font-medium text-lg flex items-center gap-2 hover:underline">
              Ver documentación
            </Link>
          </div>
        </div>

        <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-[500px] bg-blue-400 rounded-full blur-[120px] opacity-30"></div>
          </div>

          <div className="relative" style={{ perspective: "1000px" }}>
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
};
