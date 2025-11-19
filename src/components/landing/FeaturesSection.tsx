import { Cloud, Gauge, ShieldCheck } from "lucide-react";
import { JSX } from "react";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <Gauge color="#93c5fd"/>
    ),
    title: "Carga ultrarrápida",
    description: "Pool escalable de hasta 50,000 wallets trabajando en paralelo para subir tus archivos en tiempo récord.",
  },
  {
    icon: (
      <Cloud color="#93c5fd"/>
    ),
    title: "Entrega global instantánea",
    description:
      "Cloudflare CDN para delivery ultrarrápido en cualquier parte del mundo. Cacheado automático después de la primera solicitud.",
  },
  {
    icon: (
      <ShieldCheck color="#93c5fd"/>
    ),
    title: "Blockchain seguro",
    description:
      "Datos almacenados de forma inmutable en Arkiv Network con verificación criptográfica completa.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 pb-24">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-8 bg-gradient-to-br from-blue-950/40 to-black/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 hover:border-blue-600/50 transition-all hover:shadow-lg hover:shadow-blue-600/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-800/40 transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

