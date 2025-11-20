"use client";

import { Cloud, Gauge, ShieldCheck } from "lucide-react";
import { JSX, useState, useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface Feature {
  icon: JSX.Element;
  titleKey: string;
  descriptionKey: string;
  rotation?: number;
  padding?: string;
  iconSize?: number;
  iconBg?: string;
}

const features: Feature[] = [
  {
    icon: <Gauge color="#7c3aed" />,
    titleKey: "features.ultraFast.title",
    descriptionKey: "features.ultraFast.description",
    rotation: -1.2,
    padding: "2.5rem",
    iconSize: 52,
    iconBg: "bg-purple-900/40",
  },
  {
    icon: <Cloud color="#8b5cf6" />,
    titleKey: "features.globalDelivery.title",
    descriptionKey: "features.globalDelivery.description",
    rotation: 0.8,
    padding: "2.75rem",
    iconSize: 56,
    iconBg: "bg-purple-900/40",
  },
  {
    icon: <ShieldCheck color="#6b21a8" />,
    titleKey: "features.secureBlockchain.title",
    descriptionKey: "features.secureBlockchain.description",
    rotation: -0.6,
    padding: "2.5rem",
    iconSize: 54,
    iconBg: "bg-purple-900/40",
  },
];

export const FeaturesSection = () => {
  const { t } = useI18n();
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isDesktop = windowWidth >= 768;

  return (
    <section className="py-10 sm:py-14 pb-16 sm:pb-20 lg:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group backdrop-blur-sm rounded-2xl transition-all hover:-translate-y-1"
            style={{
              transform: `rotate(${isDesktop ? feature.rotation ?? 0 : 0}deg)`,
              borderRadius: "1.25rem",
            }}
            onMouseEnter={(e) => {
              if (isDesktop) {
                e.currentTarget.style.transform = `rotate(0deg) translateY(-4px)`;
              } else {
                e.currentTarget.style.transform = `translateY(-4px)`;
              }
            }}
            onMouseLeave={(e) => {
              if (isDesktop) {
                e.currentTarget.style.transform = `rotate(${
                  feature.rotation ?? 0
                }deg)`;
              } else {
                e.currentTarget.style.transform = `rotate(0deg)`;
              }
            }}
          >
            <div
              className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-5"
              style={{ 
                transform: `rotate(${isDesktop ? -(feature.rotation ?? 0) : 0}deg)` 
              }}
            >
              <div>
                <div className="flex flex-row items-center justify-start gap-3 text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3 leading-tight">
                  <div
                    className={`rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                    style={{
                      width: `${(feature.iconSize ?? 52) * (windowWidth < 640 ? 0.85 : 1)}px`,
                      height: `${(feature.iconSize ?? 52) * (windowWidth < 640 ? 0.85 : 1)}px`,
                      borderRadius: "0.875rem",
                    }}
                  >
                    <div style={{ transform: "scale(1.1)" }}>
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl">{t(feature.titleKey)}</h3>
                </div>
                <p
                  className="text-slate-400 leading-relaxed text-xs sm:text-sm lg:text-base"
                  style={{ lineHeight: "1.65" }}
                >
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
