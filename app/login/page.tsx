"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [usageType, setUsageType] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login e Cadastro
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // --- LÓGICA DE CADASTRO ATUALIZADA ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
            data: {
              full_name: fullName, 
              usage_type: usageType,
            },
          },
        });
        if (error) throw error;
        setMessage('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        // --- LÓGICA DE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/'); // Manda o usuário pra Home logado
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 text-white">
      <div className="mb-8 animate-fade-in">
        <img 
          src="/WideLogo.png" 
          alt="TechPost Logo" 
          className="h-30 w-auto object-contain"
        />
      </div>
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-center text-blue-500">
          {isSignUp ? 'Criar Conta TechPost' : 'Acessar'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm text-gray-400">Nome</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none"
                required
              />
              <label className="block text-sm text-gray-400 mb-1">Como você vai usar?</label>
              <select
                value={usageType}
                onChange={(e) => setUsageType(e.target.value)}
                className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none text-white"
              >
                <option value="personal">Uso Pessoal / Hobby</option>
                <option value="student">Estudante / Acadêmico</option>
                <option value="corporate">Profissional / Corporativo</option>
                <option value="creator">Criador de Conteúdo</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>

          {message && (
            <div className="p-3 bg-gray-800 rounded text-center text-sm text-yellow-300 border border-yellow-800">
              {message}
            </div>
          )}
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {isSignUp ? 'Já tem conta? ' : 'Não tem conta? '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
            className="text-blue-400 hover:underline"
          >
            {isSignUp ? 'Fazer Login' : 'Criar agora'}
          </button>
        </div>
      </div>
    </div>
  );
}