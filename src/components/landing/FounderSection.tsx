"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { FounderCard } from "./FounderCard";

export const FounderSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t("founder.title")}
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            {t("founder.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FounderCard
            role={t("founder1.role")}
            name={t("founder1.name")}
            description={t("founder1.description")}
            image={t("founder1.image")}
          />

          <FounderCard
            role={t("founder2.role")}
            name={t("founder2.name")}
            description={t("founder2.description")}
            image={t("founder2.image")}
            direction="up"
          />
        </div>
      </div>
    </section>
  );
};
