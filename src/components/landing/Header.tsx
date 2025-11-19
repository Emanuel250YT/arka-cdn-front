import Link from "next/link";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="pt-8 pb-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Image src="/arkacdn.png" alt="ArkaCDN" width={72} height={72} className="brightness-0 invert" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-blue-950/50 backdrop-blur-md rounded-full px-2 py-2 border border-blue-800/30">
          <a
            href="#"
            className="px-5 py-2 text-sm text-white hover:text-blue-300 transition-colors rounded-full hover:bg-blue-900/30"
          >
            Inicio
          </a>
          <a
            href="#"
            className="px-5 py-2 text-sm text-blue-300 hover:text-white transition-colors rounded-full hover:bg-blue-900/30"
          >
            Documentación
          </a>
          <a
            href="#"
            className="px-5 py-2 text-sm text-blue-300 hover:text-white transition-colors rounded-full hover:bg-blue-900/30"
          >
            GitHub
          </a>
        </div>

        <Link href="/register" className="px-6 py-2.5 bg-transparent border border-blue-600/40 text-white text-sm rounded-full hover:bg-blue-900/30 hover:border-blue-500/60 transition-all">
          Get Started
        </Link>
      </nav>
    </header>
  );
};

