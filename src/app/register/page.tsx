import { RegisterForm } from '@/components/auth/RegisterForm';
import { BackgroundEffects } from '@/components/landing/BackgroundEffects';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
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
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        <RegisterForm />
      </div>
    </div>
  );
}

