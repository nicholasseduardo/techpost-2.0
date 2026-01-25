"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importante para os links
import { Github } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [usageType, setUsageType] = useState('personal'); // Mudei o default para evitar erro de string vazia
  const [isSignUp, setIsSignUp] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // NOVO: Estado para o checkbox de termos
  const [agreed, setAgreed] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleGithubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`, 
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        
        // --- NOVA VALIDAÇÃO DE TERMOS ---
        if (!agreed) {
            setMessage("Você precisa concordar com os Termos e Política de Privacidade para criar uma conta.");
            setLoading(false);
            return; // Para a execução aqui se não marcou
        }

        // --- LÓGICA DE CADASTRO ---
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
        router.push('/dashboard'); 
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

        <button
          type="button" // Importante ser type="button" para não enviar o formulário
          onClick={handleGithubLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#24292e] hover:bg-[#2b3137] text-white p-3 rounded-lg font-bold transition-all mb-4 border border-white/10"
        >
          <Github size={20} />
          Conectar com GitHub
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">ou via e-mail</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm text-gray-400">Nome</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none mb-3"
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

          {/* --- NOVO CHECKBOX (Só aparece no Cadastro) --- */}
          {isSignUp && (
            <div className="flex items-start gap-3 my-2 pt-2">
                <div className="flex items-center h-5">
                <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 border border-gray-600 rounded bg-gray-800 focus:ring-2 focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
                </div>
                <label htmlFor="terms" className="text-xs text-gray-400 select-none">
                Eu concordo com os <Link href="/terms" target="_blank" className="text-blue-400 hover:underline">Termos de Uso</Link> e <Link href="/privacy" target="_blank" className="text-blue-400 hover:underline">Política de Privacidade</Link>.
                </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 font-bold hover:bg-blue-700 transition disabled:opacity-50 mt-4"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>

          {message && (
            <div className={`p-3 rounded text-center text-sm border ${message.includes('Verifique') ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-yellow-900/20 text-yellow-300 border-yellow-800'}`}>
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