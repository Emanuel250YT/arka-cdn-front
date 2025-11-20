"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import { BackgroundEffects } from '@/components/landing/BackgroundEffects';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { Suspense } from 'react';

export default function LoginPage() {
  const { t } = useI18n();
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
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t('auth.common.backToHome')}</span>
        </Link>

        <Suspense fallback={<div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-8 shadow-2xl animate-pulse"><div className="h-96"></div></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

