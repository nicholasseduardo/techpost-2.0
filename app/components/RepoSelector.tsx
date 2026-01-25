"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Github, ChevronDown, Loader2 } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string;
}

interface RepoSelectorProps {
  onSelect: (url: string) => void;
}

export default function RepoSelector({ onSelect }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createClient();

  // 1. Pega o Username do usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // O GitHub manda o username dentro de user_metadata.user_name ou preferred_username
      const githubUser = user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
      
      if (githubUser) {
        setUsername(githubUser);
        fetchRepos(githubUser);
      }
    };
    getUser();
  }, []);

  // 2. Busca os repositórios públicos na API do GitHub
  const fetchRepos = async (user: string) => {
    setLoading(true);
    try {
      // Busca os últimos 30 repos atualizados recentemente
      const res = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=30`);
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar repos", error);
    } finally {
      setLoading(false);
    }
  };

  if (!username) return null; // Se não logou com GitHub, não mostra nada

  return (
    <div className="mb-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 w-full md:w-auto"
      >
        <Github size={16} />
        {loading ? "Carregando repos..." : "Escolher um dos meus repositórios"}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-96 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => {
                  onSelect(repo.html_url); // Preenche o input pai
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="font-medium text-slate-200 group-hover:text-blue-400 flex justify-between">
                  {repo.name}
                  {repo.description && <span className="text-[10px] text-slate-600 border border-slate-700 px-1 rounded bg-slate-950">Public</span>}
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {repo.description}
                  </p>
                )}
              </button>
            ))}
            {repos.length === 0 && !loading && (
              <div className="p-4 text-center text-sm text-slate-500">
                Nenhum repositório público encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}