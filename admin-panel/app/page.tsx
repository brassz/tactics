'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DollarSign } from 'lucide-react';

export default function LoginPage() {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cpf.length !== 11) {
      setError('CPF deve conter 11 dígitos');
      return;
    }

    setLoading(true);

    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (error || !admin) {
        setError('CPF de administrador não encontrado');
        setLoading(false);
        return;
      }

      // Save admin data to localStorage
      localStorage.setItem('admin', JSON.stringify(admin));
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Painel Admin
          </h1>
          <p className="text-center text-gray-600 mb-8">
            NovixCred
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CPF do Administrador
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="00000000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={11}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>CPF padrão: 00000000000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
