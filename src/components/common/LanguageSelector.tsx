"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const LanguageSelector = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const languages = [
    { code: "es" as const, name: "Español", flag: "🇪🇸" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
  ];

  const currentLang = languages.find((lang) => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:text-purple-400 transition-colors rounded-full hover:bg-purple-900/20"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.flag}</span>
        <span className="hidden md:inline text-xs">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-black/95 backdrop-blur-lg border border-purple-900/30 rounded-xl shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                language === lang.code
                  ? "text-purple-400 bg-purple-900/30 font-medium"
                  : "text-white hover:text-purple-400 hover:bg-purple-900/20"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-purple-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

