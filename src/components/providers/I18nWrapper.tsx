"use client";

import { I18nProvider } from "@/i18n/I18nProvider";
import { ReactNode } from "react";

export const I18nWrapper = ({ children }: { children: ReactNode }) => {
  return <I18nProvider>{children}</I18nProvider>;
};

