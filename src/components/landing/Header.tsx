"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArkaCDNClient } from "@/lib/arka-cdn-client";
import { User } from "lucide-react";

export const Header = () => {
  const pathname = usePathname();
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return client.isAuthenticated();
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(client.isAuthenticated());
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

  const isActive = (path: string) => pathname === path;

  return (
    <header className="pt-6 pb-6 sm:pt-8 sm:pb-4">
      <nav className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative" style={{ transform: "translateY(2px)" }}>
            <Image
              src="/arkacdn.png"
              alt="ArkaCDN"
              width={64}
              height={64}
              className="brightness-0 invert"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-5 py-2 text-sm transition-colors rounded-full ${
              isActive("/")
                ? "text-purple-400 bg-purple-900/30 font-medium"
                : "text-white hover:text-purple-400 hover:bg-purple-900/20"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/playground"
            className={`px-5 py-2 text-sm transition-colors rounded-full ${
              isActive("/playground")
                ? "text-purple-400 bg-purple-900/30 font-medium"
                : "text-white hover:text-purple-400 hover:bg-purple-900/20"
            }`}
          >
            Playground
          </Link>
          <DocsLink isActive={isActive} />
          <Link
            href="https://github.com/Emanuel250YT/arka-cdn"
            className="px-5 py-2 text-sm text-white hover:text-purple-400 transition-colors rounded-full hover:bg-purple-900/20"
          >
            GitHub
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/playground"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40"
          >
            Try Playground
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-5 py-2 text-sm text-white transition-colors rounded-full hover:bg-purple-900/20"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};


interface DocsLinkProps {
  isActive: (path: string) => boolean;
}

export const DocsLink: React.FC<DocsLinkProps> = ({ isActive }) => {
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
      API Docs
    </Link>
  );
};