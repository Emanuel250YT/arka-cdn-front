"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArkaCDNClient } from "@/lib/arka-cdn-client";
import { User, Menu, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSelector } from "@/components/common/LanguageSelector";

export const Header = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return client.isAuthenticated();
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    const checkAuth = () => {
      setIsAuthenticated(client.isAuthenticated());
      setIsLoading(false)
    };
    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [client, pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="pt-4 pb-4 sm:pt-6 sm:pb-6 md:pt-8 md:pb-4">
      <nav className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" style={{ transform: "translateY(2px)" }}>
            <Image
              src="/arkacdn.png"
              alt="ArkaCDN"
              width={92}
              height={92}
              className="brightness-0 invert"
            />
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1">
          <Link
            href="/"
            className={`px-5 py-2 text-sm transition-colors rounded-full ${
              isActive("/")
                ? "text-purple-400 bg-purple-900/30 font-medium"
                : "text-white hover:text-purple-400 hover:bg-purple-900/20"
            }`}
          >
            {t("header.home")}
          </Link>
          <Link
            href="/playground"
            className={`px-5 py-2 text-sm transition-colors rounded-full ${
              isActive("/playground")
                ? "text-purple-400 bg-purple-900/30 font-medium"
                : "text-white hover:text-purple-400 hover:bg-purple-900/20"
            }`}
          >
            {t("header.playground")}
          </Link>
          <DocsLink isActive={isActive} />
          <Link
            href="https://github.com/Emanuel250YT/arka-cdn"
            className="px-5 py-2 text-sm text-white hover:text-purple-400 transition-colors rounded-full hover:bg-purple-900/20"
          >
            {t("header.github")}
          </Link>
        </div>

        <div className="hidden xl:flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/playground"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40"
          >
            {t("header.tryPlayground")}
          </Link>
          {isAuthenticated && !isLoading ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {t("header.dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-5 py-2 text-sm text-white transition-colors rounded-full hover:bg-purple-900/20"
              >
                {t("header.login")}
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30"
              >
                {t("header.register")}
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-2 text-white hover:text-purple-400 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg pt-20 px-6">
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-5 py-3 text-base transition-colors rounded-full ${
                isActive("/")
                  ? "text-purple-400 bg-purple-900/30 font-medium"
                  : "text-white hover:text-purple-400 hover:bg-purple-900/20"
              }`}
            >
              {t("header.home")}
            </Link>
            <Link
              href="/playground"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-5 py-3 text-base transition-colors rounded-full ${
                isActive("/playground")
                  ? "text-purple-400 bg-purple-900/30 font-medium"
                  : "text-white hover:text-purple-400 hover:bg-purple-900/20"
              }`}
            >
              {t("header.playground")}
            </Link>
            <Link
              href={new URL("api-docs", process.env.NEXT_PUBLIC_API_URL || "").toString()}
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-5 py-3 text-base transition-colors rounded-full ${
                isActive("/api-docs")
                  ? "text-purple-400 bg-purple-900/30 font-medium"
                  : "text-white hover:text-purple-400 hover:bg-purple-900/20"
              }`}
            >
              {t("header.apiDocs")}
            </Link>
            <Link
              href="https://github.com/Emanuel250YT/arka-cdn"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-5 py-3 text-base text-white hover:text-purple-400 transition-colors rounded-full hover:bg-purple-900/20"
            >
              {t("header.github")}
            </Link>
            
            <div className="pt-4 border-t border-purple-900/30 flex flex-col gap-3">
              <div className="flex justify-center">
                <LanguageSelector />
              </div>
              <Link
                href="/playground"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-base rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 text-center"
              >
                {t("header.tryPlayground")}
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-base rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t("header.dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-3 text-base text-white transition-colors rounded-full hover:bg-purple-900/20 text-center"
                  >
                    {t("header.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-base rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 text-center"
                  >
                    {t("header.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


interface DocsLinkProps {
  isActive: (path: string) => boolean;
}

export const DocsLink: React.FC<DocsLinkProps> = ({ isActive }) => {
  const { t } = useI18n();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const docsUrl = new URL("api-docs", apiUrl).toString();

  const active = isActive("/api-docs");

  const baseClasses =
    "px-5 py-2 text-sm transition-colors rounded-full";
  const activeClasses =
    "text-purple-400 bg-purple-900/30 font-medium";
  const inactiveClasses =
    "text-white hover:text-purple-400 hover:bg-purple-900/20";

  return (
    <Link
      href={docsUrl}
      target="_blank"
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {t("header.apiDocs")}
    </Link>
  );
};