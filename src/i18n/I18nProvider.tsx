/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import esTranslations from "./translations/es.json";
import enTranslations from "./translations/en.json";

type Language = "es" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "arka-cdn-language";

const translationsMap: Record<Language, Record<string, any>> = {
  es: esTranslations,
  en: enTranslations,
};

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "es";
  }
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
  if (savedLanguage === "es" || savedLanguage === "en") {
    return savedLanguage;
  }
  const browserLang = navigator.language.split("-")[0];
  const detectedLang: Language = browserLang === "es" ? "es" : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLang);
  return detectedLang;
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const translations = translationsMap[language] || translationsMap.es;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; 
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey] || match;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

