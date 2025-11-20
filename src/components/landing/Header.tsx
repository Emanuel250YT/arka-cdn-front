"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();

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
          <Link
            href="/api-docs"
            className={`px-5 py-2 text-sm transition-colors rounded-full ${
              isActive("/api-docs")
                ? "text-purple-400 bg-purple-900/30 font-medium"
                : "text-white hover:text-purple-400 hover:bg-purple-900/20"
            }`}
          >
            Docs
          </Link>
          <a
            href="#"
            className="px-5 py-2 text-sm text-white hover:text-purple-400 transition-colors rounded-full hover:bg-purple-900/20"
          >
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/playground"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-purple-600 text-white text-sm rounded-full hover:from-purple-600 hover:to-purple-500 transition-all font-medium shadow-lg shadow-purple-700/30 hover:shadow-purple-700/40"
          >
            Try Playground
          </Link>
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
        </div>
      </nav>
    </header>
  );
};
