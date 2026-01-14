"use client";


import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  SocialNetwork, 
  TargetAudience, 
  PostObjective, 
  PostTone, 
  GeneratedPost,
  GenerationParams
} from './types';

const App: React.FC = () => {
  // CONFIGURAÇÕES E HOOKS INICIAIS
  const router = useRouter();
  const supabase = createClient();

  // TODOS OS ESTADOS (STATES) ORGANIZADOS
  // --- Autenticação e Usuário ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isVip, setIsVip] = useState(false); 
  const [usageCount, setUsageCount] = useState(0); 

  // --- Dados do App ---
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null);

  // --- UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Formulário do Gerador ---
  const [channel, setChannel] = useState<SocialNetwork>(SocialNetwork.LINKEDIN);
  const [audience, setAudience] = useState<TargetAudience>(TargetAudience.ENGINEERS);
  const [objective, setObjective] = useState<PostObjective>(PostObjective.AUTHORITY);
  const [tone, setTone] = useState<PostTone>(PostTone.PROVOCATIVE);
  type PostLength = 'SHORT' | 'MEDIUM' | 'LONG';
  const [length, setLength] = useState<PostLength>('MEDIUM');
  const [context, setContext] = useState('');
  const [filesData, setFilesData] = useState<{ name: string; base64: string; mimeType: string }[]>([]);
  const contextSuggestions = [
    { label: "🚀 Lançamento", text: "Gostaria de anunciar uma nova funcionalidade no meu produto que resolve [PROBLEMA]. O tom deve ser empolgante." },
    { label: "🤔 Reflexão", text: "Uma reflexão sobre os desafios de ser engenheiro júnior e a importância da constância nos estudos." },
    { label: "🎓 Tutorial", text: "Um passo a passo ensinando como resolver [ERRO TÉCNICO] usando [TECNOLOGIA]." },
    { label: "🔥 Polêmica", text: "Por que eu acho que [FERRAMENTA POPULAR] está sendo superestimada pelo mercado atualmente." },
  ];

  // REFERÊNCIA PARA O SCROLL AUTOMÁTICO
  const resultRef = useRef<HTMLDivElement>(null);

  // FUNÇÃO PARA PERMITIR EDIÇÃO DO TEXTO GERADO
  const handleContentEdit = (newText: string) => {
    if (currentPost) {
      const updated = { ...currentPost, content: newText };
      setCurrentPost(updated);
      // Atualiza também no histórico local para não perder a edição se trocar de aba
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  // FUNÇÃO AUXILIAR: BUSCAR PERFIL COMPLETO
  // Essa função unifica a busca de email e status VIP para evitar erros
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || ''); 
        
        // Busca dados extras (VIP e Contagem) na tabela profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setIsVip(profile.is_vip || false);
          setUsageCount(profile.usage_count || 0);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  // USEEFFECTS

  // Verifica Autenticação ao abrir a tela
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        await fetchProfile(); // Já carrega os dados do usuário
      }
      setIsAuthChecking(false);
    };
    checkUser();
  }, [router, supabase]);

  // Verifica retorno do Pagamento (Stripe) ?success=true
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      window.history.replaceState({}, document.title, "/");
      fetchProfile(); // Força atualização imediata para liberar o VIP
      alert("Parabéns! Sua conta PRO foi ativada! 🚀");
    }
  }, []);

  // Carrega do LocalStorage (Mantive para compatibilidade, mas o Supabase vai sobrescrever depois)
  useEffect(() => {
    const savedPosts = localStorage.getItem('techpost_history');
    const savedUsage = localStorage.getItem('techpost_usage');
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedUsage) setUsageCount(parseInt(savedUsage, 10));
  }, []);

  // Carrega Histórico do Supabase (Fonte da verdade)
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return; 

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
      } else if (data) {
        // Formata os dados do banco para o formato do Frontend
        const formattedPosts: GeneratedPost[] = data.map((post: any) => ({
          id: post.id,
          topic: post.title || post.context_prompt || "Post sem título", 
          content: post.generated_text,
          timestamp: new Date(post.created_at).getTime(),
          config: { 
            channel: SocialNetwork.LINKEDIN,
            audience: post.audience, 
            objective: PostObjective.AUTHORITY, 
            tone: post.tone 
          }
        }));
        
        setPosts(formattedPosts);
      }
      
      // Aproveita para garantir que o contador está atualizado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase
          .from('profiles')
          .select('usage_count')
          .eq('id', user.id)
          .single();
          
          if (profile) {
            setUsageCount(profile.usage_count || 0);
          }
      }
    };

    fetchHistory();
  }, [isAuthenticated, supabase]);

  // HANDLERS

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Cria uma promessa para ler cada arquivo
      const fileReaders = Array.from(files).map(file => {
        return new Promise<{ name: string; base64: string; mimeType: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              base64: reader.result as string,
              mimeType: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      });

      // Quando todos forem lidos, atualiza o estado
      Promise.all(fileReaders).then(newFiles => {
        // Adiciona aos que já existem (ou substitui, se preferir setFilesData(newFiles))
        setFilesData(prev => [...prev, ...newFiles]);
      });
    }
  };

  // Função para remover um arquivo da lista
  const removeFile = (index: number) => {
    setFilesData(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCurrentPost(null);

    try {
      const params: GenerationParams = {
        channel,
        audience,
        objective,
        tone,
        context,
        filesData: filesData || undefined
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          audience,
          objective,
          tone,
          length,
          context,
          filesData: filesData.length > 0 ? filesData : undefined 
        }),
      });
      
      // --- NOVO: AQUI NÓS DETECTAMOS O BLOQUEIO ---
      if (response.status === 403) {
        setShowPaywall(true); // <--- Mostra a tela de Upgrade
        setLoading(false);    // <--- Para o ícone de carregando
        return;               // <--- Para tudo por aqui!
      }
      // --------------------------------------------

      if (!response.ok) {
        // Se não for 403 e der erro, aí sim é falha no servidor
        throw new Error('Falha ao conectar com o servidor');
      }

      const data = await response.json();
      const result = data.text; 
      const newTitle = data.title;

      const newPost: GeneratedPost = {
        id: Date.now().toString(),
        topic: newTitle || context.slice(0, 30),
        content: result,
        timestamp: Date.now(),
        config: { channel, audience, objective, tone }
      };

      setPosts([newPost, ...posts]);
      setCurrentPost(newPost);
      setUsageCount(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar o post.");
    } finally {
      // Importante checar se não é o paywall para não sobrescrever o loading
      if (!showPaywall) {
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      }
    }
  };

  // Função para chamar o Stripe
  const handleCheckout = async () => {
    try {
      setLoading(true); // Mostra que está carregando (opcional)
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        // Redireciona o usuário para o site do Stripe
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com pagamento");
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    setCurrentPost(null);
    setContext('');
    setFilesData([]);
  };

  // Se estiver checando, mostra tela preta com loading
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505] text-blue-500">
        <div className="animate-pulse font-bold">Verificando acesso...</div>
      </div>
    );
  }

  // Se checou e não tem usuário, não mostra nada (o router já mandou pro login)
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-100 font-sans">
      <Sidebar 
        posts={posts} 
        onSelectPost={setCurrentPost} 
        onNewPost={handleNewPost}
        currentPostId={currentPost?.id}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userEmail={userEmail}
        onLogout={handleLogout}
        usageCount={usageCount}
        isVip={isVip}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header - TRECHO ATUALIZADO COM BOTÃO SAIR */}
        <div className="lg:hidden p-4 border-b border-slate-900 bg-[#050505] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TechPost Logo" className="h-8 w-auto object-contain" />
          </div>
          
          <div className="flex items-center gap-3">
             {/* Seu botão de abrir menu existente */}
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 text-slate-400 hover:text-white transition-colors"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
               </svg>
             </button>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-10 max-w-[1400px] mx-auto overflow-y-auto w-full">
          <header className="mb-8 lg:mb-12 max-w-5xl">
            <p className="text-slate-300 text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
              Transforme código e documentos em textos incríveis!
            </p>
          </header>

          {showPaywall && (
            <div className="bg-[#0A0A0A] border border-blue-500/30 p-8 rounded-2xl mb-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-3 duration-500 relative overflow-hidden shadow-2xl shadow-blue-900/20">
              
              {/* EFEITO DE FUNDO (GLOW) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-20 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

              {/* BADGE DE ESCASSEZ */}
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 animate-pulse">
                ⏳ Oferta por tempo limitado
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white tracking-tight">
                Limite Gratuito Atingido  = (
              </h2>
              
              <p className="text-slate-400 mb-8 max-w-500 text-sm sm:text-base leading-relaxed">
                Você atingiu seu limite gratuito. Produza conteúdo ilimitado com o plano PRO!
              </p>

              <p className="text-slate-300 mb-8 text-sm sm:text-lg leading-relaxed max-w-lg">
                Estamos oferecendo o plano vitalício com {' '}
                <span className="font-black text-blue-400">70%</span>
                {' '} de desconto e{' '}
                <span className="font-black text-blue-400">pagamento único</span>
                {' '}para os 100 primeiros usuários, não perca essa oportunidade!
              </p>

              {/* ÁREA DO PREÇO */}
              <div className="flex flex-col items-center mb-8 relative">
                {/* Preço Âncora (Riscado) */}
                <span className="text-slate-600 text- font-bold line-through mb-1 decoration-red-500/45 decoration-2">
                  De R$ 49,67
                </span>
                
                {/* Preço Real (Grande e Azul) */}
                <div className="flex items-end gap-1 leading-none">
                  <span className="text-4xl font-bold text-blue-500">R$</span>
                  <span className="text-6xl sm:text-7xl font-black text-blue-500 tracking-tighter drop-shadow-lg">
                    14,90
                  </span>
                </div>
              </div>

              {/* BOTÃO DE AÇÃO */}
              <button
                onClick={handleCheckout}
                className="w-full sm:w-auto min-w-[280px] bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 hover:scale-105 hover:shadow-blue-500/30 active:scale-95 group"
              >
                DESBLOQUEAR AGORA
              </button>

              <button 
                onClick={() => setShowPaywall(false)} 
                className="mt-6 text-xs font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                Voltar e esperar renovar
              </button>
            </div>
          )}

        {/* --- NOVO LAYOUT "BLOCO COMPACTO" --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* BLOCO DA ESQUERDA: SELETORES (Ocupa 8 colunas) */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-2 ">
                
                {/* LINHA 1: 3 Seletores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Canal</label>
                        <select 
                          value={channel} 
                          onChange={(e) => setChannel(e.target.value as SocialNetwork)}
                          className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                          {Object.values(SocialNetwork).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Público</label>
                        <select 
                          value={audience}
                          onChange={(e) => setAudience(e.target.value as TargetAudience)}
                          className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                          {Object.values(TargetAudience).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objetivo</label>
                        <select 
                          value={objective}
                          onChange={(e) => setObjective(e.target.value as PostObjective)}
                          className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                          {Object.values(PostObjective).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>

                {/* LINHA 2: 2 Seletores (Espandidos para preencher a largura) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tom de Voz</label>
                        <select 
                          value={tone}
                          onChange={(e) => setTone(e.target.value as PostTone)}
                          className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                          {Object.values(PostTone).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tamanho</label>
                        <select 
                          value={length}
                          onChange={(e) => setLength(e.target.value as PostLength)}
                          className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                           <option value="SHORT">Curto (Post Rápido)</option>
                           <option value="MEDIUM">Médio (Padrão)</option>
                           <option value="LONG">Longo (Artigo/Deep Dive)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* BLOCO DA DIREITA: ANEXOS (Ocupa 4 colunas e Altura Total) */}
            <div className="lg:col-span-4 space-y-2 flex flex-col">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anexos de Referência</label>
               <div className="relative group cursor-pointer flex-1 min-h-[130px]">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-full bg-[#0a101f]/30 border border-dashed border-slate-800 group-hover:border-blue-500/50 rounded-xl flex flex-col items-center justify-center transition-all p-4 text-center">
                     <div className="p-3 bg-slate-900/50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                     </div>
                     <p className="text-xs font-semibold text-slate-300">Arraste ou clique para upload</p>
                     <p className="text-[9px] text-slate-500 mt-1">PDF, PNG, JPG (Múltiplos)</p>
                  </div>
               </div>

               {/* Lista de Arquivos Miniatura */}
               {filesData.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-1">
                   {filesData.map((file, index) => (
                     <div key={index} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-medium max-w-full">
                        <span className="truncate flex-1 max-w-[120px]">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="hover:text-red-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
        </div>

        {/* --- ÁREA DE CONTEXTO --- */}
        <div className="space-y-3">
            {/* Título e Sugestões alinhados */}
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 ⚡ Sem criatividade? Teste estes contextos:
               </label>
            
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {contextSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setContext(suggestion.text)}
                      className="flex-shrink-0 px-4 py-2 bg-slate-800/40 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/30 text-slate-300 text-xs font-medium rounded-lg border border-slate-800 transition-all whitespace-nowrap"
                    >
                      {suggestion.label}
                    </button>
                  ))}
               </div>
            </div>
        </div>

          {/* Full-width Context Section */}
          <div className="w-full space-y-2 mb-10">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contexto:</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Descreva sobre o que é o post, cole trechos de código ou explique o objetivo..."
              className="w-full h-32 bg-[#0a101f]/30 border border-slate-800/60 rounded-xl p-5 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed text-slate-300 placeholder:text-slate-700 shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-16">
            <button 
              onClick={handleGenerate}
              disabled={loading || context.length < 5}
              className={`w-full sm:w-auto px-12 py-3.5 rounded-lg font-bold transition-all shadow-2xl flex items-center justify-center gap-3 ${
                loading || context.length < 5
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1 shadow-blue-600/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  GERANDO...
                </>
              ) : (
                'GERAR POST'
              )}
            </button>
            {/* LÓGICA DO STATUS (VIP vs FREE) */}
            {isVip ? (
              // SE FOR VIP
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                 <span className="text-base">👑</span>
                 <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Acesso Ilimitado</span>
              </div>
            ) : (
              // SE FOR FREE (Mostra contagem)
              usageCount < 3 && (
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                   <span className="text-[11px] text-blue-400 font-black uppercase tracking-widest text-center">
                     {2 - usageCount} Gerações Gratuitas Restantes
                   </span>
                </div>
              )
            )}
          </div>

          {(currentPost || loading) && (
            <section className="bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/20">
                <h3 className="text-lg sm:text-xl font-bold text-blue-400 flex items-center gap-3 tracking-tight">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {loading ? 'Criando seu post...' : 'Post Criado com Sucesso'}
                </h3>
                {currentPost && (
                  <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-16">
                    
                    {/* Cabeçalho do Card de Sucesso */}
                    <div className="bg-[#0a101f]/40 border border-slate-800/60 rounded-t-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-200">Post Criado com Sucesso</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Edite o texto abaixo se necessário</p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => navigator.clipboard.writeText(currentPost.content)}
                         className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 border border-slate-700"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2v2h-4V5z" /></svg>
                         COPIAR
                       </button>
                    </div>

                    {/* ÁREA EDITÁVEL */}
                    <div className="bg-[#0a101f]/20 border-x border-b border-slate-800/60 rounded-b-xl p-6 md:p-8">
                      <textarea
                        value={currentPost.content}
                        onChange={(e) => handleContentEdit(e.target.value)}
                        className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 text-slate-300 text-base leading-loose resize-y outline-none font-light"
                        spellCheck={false}
                      />
                    </div>
                    
                  </div>
                )}
              </div>

              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-800/40 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800/40 rounded w-full"></div>
                  <div className="h-4 bg-slate-800/40 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800/40 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-800/40 rounded w-4/6"></div>
                </div>
              ) : (
                currentPost && <MarkdownRenderer content={currentPost.content} />
              )}
            </section>
          )}

          {error && (
            <div className="mt-8 p-5 bg-red-900/5 border border-red-900/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
               <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
