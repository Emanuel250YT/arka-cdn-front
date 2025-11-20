'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArkaCDNClient } from '@/lib/arka-cdn-client';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterForm = () => {
  const router = useRouter();
  const [client] = useState(() => new ArkaCDNClient(undefined, 'user'));
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await client.register(
        formData.email,
        formData.password,
        formData.name || undefined
      );

      setSuccess(true);
      
      setTimeout(async () => {
        try {
          await client.login(formData.email, formData.password);
          router.push('/playground');
        } catch {
          router.push('/login?registered=true');
        }
      }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
        <p className="text-purple-300">Únete a Arka CDN y comienza a usar el almacenamiento descentralizado</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">¡Cuenta creada exitosamente!</p>
            <p className="text-green-400 text-sm mt-1">Redirigiendo...</p>
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
          <label htmlFor="name" className="block text-sm font-medium text-purple-300 mb-2">
            Nombre (opcional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-purple-700/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Tu nombre"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-3 border border-purple-700/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
            Contraseña <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 border border-purple-700/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-300 mb-2">
            Confirmar contraseña <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 border border-purple-700/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Repite tu contraseña"
              disabled={loading}
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
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-purple-300 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

