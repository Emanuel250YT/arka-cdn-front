"use client";

import { Target, Users, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export const MissionSection = () => {
  const { t } = useI18n();

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      titleKey: "mission.values.decentralization.title",
      descriptionKey: "mission.values.decentralization.description",
    },
    {
      icon: <Users className="w-6 h-6" />,
      titleKey: "mission.values.accessibility.title",
      descriptionKey: "mission.values.accessibility.description",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      titleKey: "mission.values.innovation.title",
      descriptionKey: "mission.values.innovation.description",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t("mission.title")}
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
            {t("mission.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-6 lg:p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-700/30 hover:border-purple-600/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-900/40 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t(value.titleKey)}
                </h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {t(value.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

