"use client";

import Link from "next/link";
import { PenTool, LayoutList, Github, Sparkles, ArrowRight, ChevronDown, ChevronUp, Code2, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const CACHE_DURATION = 24 * 60 * 60 * 1000; 
const CACHE_KEY = "techpost_suggestions_cache";

// Tipos atualizados para suportar múltiplas ideias
interface Idea {
  title: string;
  context_prompt: string;
}

interface RepoSuggestion {
  repo_name: string;
  ideas: Idea[];
}

export default function DashboardHome() {
  const router = useRouter();
  const supabase = createClient();

  const [githubUser, setGithubUser] = useState("");
  const [isGithubSaved, setIsGithubSaved] = useState(false);
  const [suggestions, setSuggestions] = useState<RepoSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [userName, setUserName] = useState("Dev"); 

  // Estado para controlar qual ideia está expandida (formato: "indexRepo-indexIdea")
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);

  const isFetching = useRef(false);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    // BLOQUEIO: Se já está buscando ou já tem sugestões, não faz nada
    if (isFetching.current || suggestions.length > 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Busca Nome
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
        }

        let targetUser = "";
        const ghHandle = user.user_metadata?.user_name || user.user_metadata?.preferred_username;
        
        if (ghHandle) targetUser = ghHandle;
        else targetUser = localStorage.getItem("techpost_gh_user") || "";

        if (targetUser) {
            setGithubUser(targetUser);
            setIsGithubSaved(true);
            loadSuggestions(targetUser);
        }
    }
  };

  const loadSuggestions = (username: string) => {
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
          const { data, timestamp, user } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          const isSameUser = user === username;

          if (isSameUser && !isExpired) {
              console.log("Usando cache local de sugestões ⚡");
              setSuggestions(data);
              return;
          }
      }
      // Se não tem cache, vai pra API (mas passa pela trava lá dentro)
      fetchFromApi(username);
  };

  const fetchFromApi = async (username: string) => {
    // Impede chamadas simultâneas
    if (isFetching.current) return;
    
    isFetching.current = true;
    setLoadingSuggestions(true);
    
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      
      const data = await res.json();
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: data.suggestions,
            timestamp: Date.now(),
            user: username
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões", error);
    } finally {
      setLoadingSuggestions(false);
      isFetching.current = false; 
    }
  };

  const handleSaveGithub = () => {
    if (!githubUser) return;
    localStorage.setItem("techpost_gh_user", githubUser);
    setIsGithubSaved(true);
    isFetching.current = false; 
    fetchFromApi(githubUser);
  };

  const handleRefresh = () => {
      localStorage.removeItem(CACHE_KEY); 
      isFetching.current = false; 
      fetchFromApi(githubUser); 
  };
  
  const handleUseSuggestion = (context: string) => {
    const encodedContext = encodeURIComponent(context);
    router.push(`/dashboard/gerar?context=${encodedContext}`);
  };

  const toggleIdea = (id: string) => {
    setExpandedIdea(expandedIdea === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bem vindo, <span className="text-blue-500">{userName}</span>!
        </h1>
        <p className="text-slate-400">O que vamos criar hoje?</p>
      </div>

      {/* --- ÁREA DE SUGESTÕES (REPO EM DESTAQUE) --- */}
      <div className="bg-[#050a1f]/30 rounded-[22px] p-6 sm:p-8">

        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Ideias do dia para você</h3>
            <p className="text-sm text-slate-400">Baseado nos seus repositórios recentes</p>
          </div>
        </div>

        {!isGithubSaved ? (
          // TELA 1: Conectar GitHub
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/50 p-6 rounded-xl border border-slate-800 border-dashed">
            <div className="p-3 bg-slate-800 rounded-full text-white">
              <Github size={24} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-slate-300 font-medium mb-1">Conecte seu GitHub para receber ideias mágicas</p>
              <p className="text-xs text-slate-500">Analisamos seus commits recentes para sugerir posts.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Seu usuário GitHub"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500 w-full"
              />
              <button onClick={handleSaveGithub} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Conectar
              </button>
            </div>
          </div>
        ) : loadingSuggestions ? (
          // TELA 2: Loading
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm animate-pulse">Lendo seus repositórios...</p>
          </div>
        ) : (
          // TELA 3: Cards de Repo + Ideias Expansíveis
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((repo, repoIdx) => (
              <div key={repoIdx} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">

                {/* Cabeçalho do Card: NOME DO REPO GRANDE */}
                <div className="p-5 bg-slate-800/50 border-b border-slate-700/50">
                  <h3 className="text-lg font-black text-white truncate" title={repo.repo_name}>
                    {repo.repo_name}
                  </h3>
                </div>

                {/* Lista de Ideias (Opções) */}
                <div className="p-2 flex-1 flex flex-col gap-1">
                  {repo.ideas.map((idea, ideaIdx) => {
                    const id = `${repoIdx}-${ideaIdx}`;
                    const isOpen = expandedIdea === id;

                    return (
                      <div key={ideaIdx} className={`rounded-xl transition-all duration-300 ${isOpen ? 'bg-slate-800 ring-1 ring-blue-500/30' : 'hover:bg-slate-800/50'}`}>

                        {/* Título Clicável */}
                        <button
                          onClick={() => toggleIdea(id)}
                          className="w-full text-left p-3 flex items-start justify-between gap-3"
                        >
                          <span className={`text-sm font-medium leading-snug ${isOpen ? 'text-blue-300' : 'text-slate-300'}`}>
                            {idea.title}
                          </span>
                          {isOpen ? <ChevronUp size={16} className="text-blue-500 shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-slate-600 shrink-0 mt-0.5" />}
                        </button>

                        {/* Conteúdo Expansível */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out px-3 ${isOpen ? 'max-h-48 pb-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-xs text-slate-400 mb-3 border-l-2 border-slate-700 pl-2 leading-relaxed">
                            {idea.context_prompt}
                          </p>
                          <button
                            onClick={() => handleUseSuggestion(idea.context_prompt)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                          >
                            <PenTool size={12} /> Trabalhar nesta ideia
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={() => { setIsGithubSaved(false); setSuggestions([]); }} className="col-span-1 md:col-span-3 text-xs text-slate-600 hover:text-slate-400 text-center mt-4 underline">
              Trocar usuário GitHub
            </button>
          </div>
        )}
      </div>


      {/* --- CARDS PRINCIPAIS (DESIGN CORRIGIDO: ÍCONE AO LADO DO TÍTULO) --- */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Cartão 1: Gerar Post */}
        <Link href="/dashboard/gerar" className="group relative overflow-hidden bg-[#0f172a] hover:bg-[#1e293b] border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] h-48 flex flex-col justify-between">

          {/* Header Alinhado (Ícone + Texto) */}
          <div className="flex items-start gap-4 z-10">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">Gere um post com IA</h3>
              <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">De ideias ou código a posts virais em segundos.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              Começar agora
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Cartão 2: Meus Posts */}
        <Link href="/dashboard/posts" className="group relative overflow-hidden bg-[#0f172a] hover:bg-[#1e293b] border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] h-48 flex flex-col justify-between">

          {/* Header Alinhado (Ícone + Texto) */}
          <div className="flex items-start gap-4 z-10">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform shrink-0">
              <LayoutList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">Seus Posts</h3>
              <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">Gerencie seu Kanban de ideias e publicações.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              Ver Kanban
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

      </div>

    </div>
  );
}