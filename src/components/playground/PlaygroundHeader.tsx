'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ArkaCDNClient } from '@/lib/arka-cdn-client';
import { useRouter } from 'next/navigation';

export const PlaygroundHeader = () => {
  const router = useRouter();
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(client.isAuthenticated());
    if (client.isAuthenticated()) {
    }
  }, [client]);

  const handleLogout = async () => {
    await client.logout();
    setIsAuthenticated(false);
    setUserEmail(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-blue-950/30 border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>
            <div className="h-6 w-px bg-blue-700/50"></div>
            <div>
              <h1 className="text-lg font-bold text-white">Arka CDN</h1>
              <p className="text-xs text-blue-400">Playground</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="#try-it"
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors hidden sm:block"
            >
              Try it now
            </a>
            <a
              href="#explorer"
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors hidden sm:block"
            >
              Explorer
            </a>
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </a>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-blue-700/50">
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Autenticado</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-300 hover:text-red-300 transition-colors rounded-lg hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-4 border-l border-blue-700/50">
                <Link
                  href="/login?redirect=/playground"
                  className="px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register?redirect=/playground"
                  className="px-4 py-2 text-sm bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
