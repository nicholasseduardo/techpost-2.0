"use client";


import React, { useState, useEffect } from 'react';
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
  // --- BLOCO NOVO DE SEGURANÇA ---
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Verifica se tem usuário logado assim que a tela abre
  useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserEmail(user.email || ''); // <--- SALVA O EMAIL AQUI
    }
    setIsAuthChecking(false);
  };
  checkUser();
  }, [router, supabase]);

  // Adicione isso logo no começo do componente, perto dos outros useEffects
  useEffect(() => {
    // Se a URL tiver ?success=true (voltou do Stripe), limpa a URL para ficar bonita
    // O Supabase vai recarregar o perfil automaticamente na função fetchProfile
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      // Remove o ?success=true da URL sem recarregar a página
      window.history.replaceState({}, document.title, "/");
      // Força um refresh dos dados do usuário para garantir que o VIP apareça
      fetchProfile(); 
      alert("Parabéns! Sua conta PRO foi ativada! 🚀");
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Form States
  const [channel, setChannel] = useState<SocialNetwork>(SocialNetwork.LINKEDIN);
  const [audience, setAudience] = useState<TargetAudience>(TargetAudience.ENGINEERS);
  const [objective, setObjective] = useState<PostObjective>(PostObjective.AUTHORITY);
  const [tone, setTone] = useState<PostTone>(PostTone.PROVOCATIVE);
  const [context, setContext] = useState('');
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('techpost_history');
    const savedUsage = localStorage.getItem('techpost_usage');
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedUsage) setUsageCount(parseInt(savedUsage, 10));
  }, []);

  // --- NOVO: Carregar histórico do Supabase ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return; // Só busca se tiver logado

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // Mais recentes primeiro

      if (error) {
        console.error('Erro ao buscar histórico:', error);
      } else if (data) {
        // Mapear: O banco usa snake_case, mas seu Frontend usa outros nomes
        const formattedPosts: GeneratedPost[] = data.map((post: any) => ({
          id: post.id,
          topic: post.title || post.context_prompt || "Post sem título", 
          content: post.generated_text,
          timestamp: new Date(post.created_at).getTime(),
          config: { 
            channel: SocialNetwork.LINKEDIN, // Valor padrão ou salvar no banco futuramente
            audience: post.audience, 
            objective: PostObjective.AUTHORITY, // Valor padrão
            tone: post.tone 
          }
        }));
        
        setPosts(formattedPosts);
      }
      
      // Também atualiza o contador visual
      const { data: profile } = await supabase
        .from('profiles')
        .select('usage_count')
        .single();
        
      if (profile) {
        setUsageCount(profile.usage_count || 0);
      }
    };

    fetchHistory();
  }, [isAuthenticated, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
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
        fileData: fileData || undefined
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
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
    setFileData(null);
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
             {/* NOVO: Botão Sair (aparece no celular) */}
             <button onClick={handleLogout} className="text-xs text-red-400 font-bold border border-red-900/50 px-3 py-1 rounded bg-red-900/10">
                SAIR
             </button>

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
              Transforme código e documentos em conteúdo de alta performance.
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

          {/* Top Section: Selectors and Attachment */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 items-stretch">
            {/* Selectors Column */}
            <div className="flex-[2]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-10 sm:gap-y-5">
                {[
                  { label: 'Canal', value: channel, setter: setChannel, options: SocialNetwork },
                  { label: 'Público', value: audience, setter: setAudience, options: TargetAudience },
                  { label: 'Objetivo', value: objective, setter: setObjective, options: PostObjective },
                  { label: 'Tom', value: tone, setter: setTone, options: PostTone },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</label>
                    <select 
                      value={item.value} 
                      onChange={(e) => item.setter(e.target.value as any)}
                      className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-200 cursor-pointer hover:bg-[#0d162b]"
                    >
                      {Object.values(item.options).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachment Column */}
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anexar</label>
              <div className="min-h-[160px] lg:h-[calc(100%-28px)] border border-dashed border-slate-800/60 rounded-xl p-6 bg-[#0a101f]/30 flex flex-col items-center justify-center text-center group hover:border-blue-600/50 transition-colors cursor-pointer relative">
                <svg className="w-10 h-10 text-slate-700 mb-2 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-xs font-semibold text-slate-300 mb-1">Drag and drop file here</p>
                <p className="text-[9px] text-slate-600 mb-5 uppercase tracking-wider">PDF, PNG, JPG, JPEG</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={handleFileChange} 
                />
                <label 
                  htmlFor="file-upload" 
                  className="bg-[#1e293b] hover:bg-slate-700 text-white px-5 py-2 rounded text-[10px] font-bold cursor-pointer transition-all shadow-md"
                >
                  Browse files
                </label>
                {fileData && <p className="mt-4 text-[10px] text-blue-400 font-bold uppercase animate-pulse">Arquivo Carregado ✓</p>}
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
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(currentPost.content);
                      // Visual feedback could be added here
                    }}
                    className="w-full sm:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-slate-800/50 hover:bg-slate-700 transition-all border border-slate-700/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    COPIAR CONTEÚDO
                  </button>
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
