'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArkaCDNClient } from '@/lib/arka-cdn-client';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowRegisteredMessage(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowRegisteredMessage(false);

    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    setLoading(true);

    try {
      await client.login(formData.email, formData.password);
      
      const redirectTo = searchParams.get('redirect') || '/playground';
      router.push(redirectTo);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h1>
        <p className="text-purple-300">Accede a tu cuenta de Arka CDN</p>
      </div>

      {showRegisteredMessage && (
        <div className="mb-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">¡Cuenta creada exitosamente!</p>
            <p className="text-green-400 text-sm mt-1">Ahora puedes iniciar sesión</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-3 border border-purple-700/50 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-3 border border-purple-700/50 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Tu contraseña"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-700/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        <p className="text-purple-300 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Regístrate
          </Link>
        </p>
        <Link
          href="/playground"
          className="block text-purple-400 hover:text-purple-300 text-sm transition-colors"
        >
          Continuar sin cuenta (modo demo)
        </Link>
      </div>
    </div>
  );
};

