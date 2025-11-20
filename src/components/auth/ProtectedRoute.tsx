'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArkaCDNClient } from '@/lib/arka-cdn-client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const router = useRouter();
  const [client] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return new ArkaCDNClient(undefined, 'user');
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !client) {
      return;
    }

    const checkAuth = async () => {
      try {
        const hasToken = client.isAuthenticated();
        
        if (!hasToken) {
          setIsAuthenticated(false);
          setIsChecking(false);
          router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        try {
          await client.getProfile();
          setIsAuthenticated(true);
        } catch {
          await client.logout();
          setIsAuthenticated(false);
          router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [client, router, redirectTo]);

  if (isChecking || isAuthenticated === null) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(107, 33, 168, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.2) 0%, transparent 50%),
            linear-gradient(to bottom, #0a0a0a 0%, #0d0d0d 30%, #0f0f0f 55%, #0b0b0b 75%, #0a0a0a 100%)
          `,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

