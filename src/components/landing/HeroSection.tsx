"use client";

import Link from "next/link";
import { FloatingCards } from "./FloatingCard";
import { useI18n } from "@/i18n/I18nProvider";

export const HeroSection = () => {
  const { t } = useI18n();
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-start">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 text-sm sm:text-base">[</span>
            <p className="text-gray-200 font-medium text-sm sm:text-base">{t("hero.organizations")}</p>
            <span className="text-purple-500 text-sm sm:text-base">]</span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-white leading-tight"
              style={{ lineHeight: "1.1" }}
            >
              {t("hero.title1")}
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
                style={{ letterSpacing: "-0.02em" }}
              >
                {t("hero.title2")}
              </span>
              <br />{t("hero.title3")}
            </h1>
          </div>

          <p
            className="text-sm sm:text-base md:text-lg text-slate-400 max-w-xl"
            style={{ lineHeight: "1.7", marginTop: "8px" }}
          >
            {t("hero.description", { network: t("hero.network") })}
            <span className="text-slate-300"> {t("hero.pricing")}</span>,{" "}
            {t("hero.pricingDetail")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 pt-2">
            <Link
              href="/register"
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-medium text-base sm:text-lg hover:from-purple-600 hover:to-purple-500 transition-all shadow-lg shadow-purple-700/40 hover:shadow-purple-600/50 flex items-center justify-center gap-2"
            >
              {t("hero.ctaStart")}
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
            <Link
              href="/api-docs"
              className="group px-6 sm:px-7 py-3 sm:py-3.5 text-slate-300 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 hover:text-white hover:underline"
            >
              {t("hero.ctaDocs")}
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <path
                  d="M10 15L15 10L10 5M15 10H5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div
          className="hidden lg:block relative h-[300px] sm:h-[380px] md:h-[420px] lg:h-[580px] flex items-center justify-center mt-8 lg:mt-0"
          style={{ paddingLeft: "8px", paddingTop: "16px" }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: "translateX(12px) translateY(-8px)" }}
          >
            <div
              className="w-48 h-64 sm:w-64 sm:h-80 md:w-72 md:h-96 bg-purple-700 rounded-full blur-[100px] sm:blur-[120px] md:blur-[140px] opacity-20"
              style={{ transform: "rotate(12deg)" }}
            />
            <div
              className="absolute w-40 h-56 sm:w-56 sm:h-72 md:w-64 md:h-80 bg-purple-600 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] opacity-15"
              style={{
                transform: "translateX(-20px) translateY(30px) rotate(-8deg)",
              }}
            />
          </div>

          <div className="relative w-full" style={{ perspective: "1000px" }}>
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
};
