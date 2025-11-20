"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import { Github, Heart } from "lucide-react";

export const Footer = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { href: "/", label: t("footer.links.features") },
    { href: "/playground", label: t("footer.links.playground") },
    {
      href: new URL("api-docs", process.env.NEXT_PUBLIC_API_URL || "").toString(),
      label: t("footer.links.apiDocs"),
      external: true,
    },
  ];

  const companyLinks = [
    { href: "/#mission", label: t("footer.links.mission") },
    { href: "/#founder", label: t("footer.links.founder") },
  ];

  const resourceLinks = [
    {
      href: "https://github.com/Emanuel250YT/arka-cdn",
      label: t("footer.links.github"),
      external: true,
    },
  ];

  return (
    <footer className="border-t border-purple-900/30 bg-[#0d0d0d] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/arkacdn.png"
                alt="ArkaCDN"
                width={48}
                height={48}
                className="brightness-0 invert"
              />
              <span className="text-xl font-bold text-white">Arka CDN</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("footer.links.product")}
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("footer.links.company")}
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t("footer.links.resources")}
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-2"
                  >
                    {link.label === t("footer.links.github") && (
                      <Github className="w-4 h-4" />
                    )}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-purple-900/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 text-center md:text-left">
              {t("footer.copyright", { year: String(currentYear) })}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{t("footer.madeWith")}</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

