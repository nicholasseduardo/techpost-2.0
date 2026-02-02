"use client";


import React, { useState, useEffect, useRef, Suspense } from 'react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import RepoSelector from '../../components/RepoSelector';
import { SocialNetwork, TargetAudience, PostObjective, PostTone, GeneratedPost, GenerationParams } from '../../types';
import { Link2, Wand2, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';


const GeneratorContent = () => {
  // CONFIGURAÇÕES E HOOKS INICIAIS
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams(); // <--- Hook para ler URL
  const postIdFromUrl = searchParams.get('id'); // <--- Pega o ID (?id=...)
  const contextFromUrl = searchParams.get('context'); //

  // TODOS OS ESTADOS (STATES) ORGANIZADOS
  // --- Autenticação e Usuário ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [cpf, setCpf] = useState('');
  const [showModal, setShowModal] = useState(false);

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
  const [repoUrl, setRepoUrl] = useState('');

  const contextSuggestions = [
    { label: "🚀 Lançamento", text: "Gostaria de anunciar uma nova funcionalidade no meu produto que resolve [PROBLEMA]. O tom deve ser empolgante." },
    { label: "🤔 Reflexão", text: "Uma reflexão sobre os desafios de ser engenheiro júnior e a importância da constância nos estudos." },
    { label: "🎓 Tutorial", text: "Um passo a passo ensinando como resolver [ERRO TÉCNICO] usando [TECNOLOGIA USADA]." },
    { label: "🔥 Polêmica", text: "Por que eu acho que [FERRAMENTA POPULAR] está sendo superestimada pelo mercado atualmente." },
  ];

  // Ref para clicar no input escondido via código
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estado para mudar a cor da borda quando estiver arrastando
  const [isDragging, setIsDragging] = useState(false);

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

  // Função que formata o CPF (000.000.000-00) enquanto digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove letras
    if (value.length > 11) value = value.slice(0, 11); // Limita tamanho

    // Aplica a máscara visual
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    setCpf(value);
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


  // ------- USEEFFECTS -------

  useEffect(() => {
    if (contextFromUrl) {
      // Decodifica o texto da URL e preenche o input
      setContext(decodeURIComponent(contextFromUrl));

      // Opcional: Rola a tela suavemente até a área de contexto para o usuário ver
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }, [contextFromUrl]);


  useEffect(() => {
    if (postIdFromUrl) {
      loadPostForEditing(postIdFromUrl);
    }
  }, [postIdFromUrl]);

  const loadPostForEditing = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Preenche os campos do formulário
        setContext(data.context_prompt || "");
        setAudience(data.audience as TargetAudience);
        setTone(data.tone as PostTone);
        // ... pode setar outros campos se quiser

        // Mostra o resultado gerado
        setCurrentPost({
          id: data.id,
          topic: data.title,
          content: data.generated_text,
          // ... preencha o resto com dados do banco ou placeholders  
          platform: data.platform || 'LinkedIn',
          style: data.tone,
          createdAt: new Date(data.created_at)
        });

        // Rola a tela até o resultado automaticamente
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } catch (err) {
      console.error("Erro ao carregar post:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const [refining, setRefining] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");

  // HANDLERS

  const handleSaveChanges = async () => {
    if (!currentPost) return;
    setSaving(true);

    try {
      // Cenário 1: Editando um post existente (tem ID na URL)
      if (postIdFromUrl) {
        const { error } = await supabase
          .from('posts')
          .update({ generated_text: currentPost.content }) // Atualiza o texto
          .eq('id', postIdFromUrl);

        if (error) throw error;
        alert("Alterações salvas com sucesso! 💾");
      }
      // Cenário 2: Salvando um post novo (acabou de gerar)
      else {
        const { data, error } = await supabase
          .from('posts')
          .insert([{
            title: currentPost.topic || "Post Novo",
            generated_text: currentPost.content,
            audience: audience,
            tone: tone,
            platform: currentPost.platform || channel,
            status: 'draft' // Salva como rascunho
          }])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          // Atualiza a URL sem recarregar a página para virar modo de edição
          const newId = data[0].id;
          window.history.replaceState(null, '', `/dashboard/gerar?id=${newId}`);
          alert("Post salvo em Rascunhos! 💾");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // --- FUNÇÃO: REFINAR COM IA ---
  const handleRefine = async () => {
    if (!currentPost || !refineInstruction) return;
    setRefining(true);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentPost.content,
          instruction: refineInstruction
        })
      });

      const data = await response.json();

      if (data.refinedText) {
        // Atualiza o texto do post com a versão refinada
        handleContentEdit(data.refinedText);
        setRefineInstruction(""); // Limpa o input
      }

    } catch (err) {
      alert("Erro ao refinar texto.");
    } finally {
      setRefining(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 1. Função que processa os arquivos (Reutilizável)
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

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

    Promise.all(fileReaders).then(newFiles => {
      setFilesData(prev => [...prev, ...newFiles]);
    });
  };

  // 2. Handler do Input (Clique)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reseta o input para permitir selecionar o mesmo arquivo novamente se precisar
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Handlers de Drag & Drop (O segredo para funcionar o arrastar)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Pega os arquivos do evento de DROP (dataTransfer)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  // Função para remover arquivo da lista (UX básica)
  const removeFile = (indexToRemove: number) => {
    setFilesData(prev => prev.filter((_, index) => index !== indexToRemove));
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
          filesData: filesData.length > 0 ? filesData : undefined,
          repoUrl: repoUrl,
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
        
        platform: channel, 
        
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

  const handleCheckout = async () => {
    // Limpa a formatação para validar
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      alert("Por favor, preencha um CPF válido para a Nota Fiscal.");
      return;
    }

    try {
      setLoading(true);

      // Chama a nossa API nova do Asaas
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ cpf: cpfLimpo }), // Envia o CPF limpo
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redireciona para o Asaas
      } else {
        alert(`Erro: ${data.error || "Tente novamente mais tarde"}`);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão. Verifique sua internet.");
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
      <div className="flex items-center justify-center h-screen bg-[#050a1f]/20 text-blue-500 rounded-xl">
        <div className="animate-pulse font-bold">Verificando acesso...</div>
      </div>
    );
  }

  // Se checou e não tem usuário, não mostra nada (o router já mandou pro login)
  if (!isAuthenticated) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8 lg:mb-12 max-w-5xl">
        <p className="text-slate-300 text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
          Transforme código e documentos em textos incríveis!
        </p>
      </header>

      {showPaywall && (
        /* --- 1. ENVELOPE QUE CRIA O POPUP/OVERLAY --- */
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 h-full w-full overflow-y-auto">

          {/* ---  LIMITADOR PARA O CARD NÃO FICAR GIGANTE --- */}
          <div className="w-full max-w-3xl animate-in zoom-in-95 duration-500">

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
                {' '} de desconto para os 100 primeiros usuários, não perca essa oportunidade!
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
                  <span className="text-4xl font-bold text-blue-500">/mês</span>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL (Abre o Modal) */}
              <button
                onClick={() => setShowModal(true)}
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

            {/* --- O MODAL (POPUP) - AGORA FICA FORA DO CARTÃO --- */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#111] border border-slate-800 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200">

                  {/* Botão de Fechar (X) */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>

                  <h3 className="text-xl font-bold text-white mb-2">Quase lá! 🚀</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Para emitir sua nota fiscal e liberar o acesso, precisamos do seu CPF. Essas informações não ficam guardadas!
                  </p>

                  {/* Input de CPF */}
                  <div className="text-left mb-6">
                    <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase tracking-wide">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-[#0A0A0A] border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-lg outline-none transition-colors placeholder:text-slate-700 font-mono"
                    />
                  </div>

                  {/* Botão de Confirmar e Pagar */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? "Gerando Pix/Boleto..." : "CONFIRMAR E PAGAR"}
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* COLUNA DA ESQUERDA: Todos os Seletores + GitHub */}
        <div className="lg:col-span-8 flex flex-col gap-2">

          {/* LINHA 1: Canal, Público, Objetivo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Canal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SocialNetwork)}
                className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all hover:border-slate-700"
              >
                {Object.values(SocialNetwork).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Público</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as TargetAudience)}
                className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all hover:border-slate-700"
              >
                {Object.values(TargetAudience).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as PostObjective)}
                className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all hover:border-slate-700"
              >
                {Object.values(PostObjective).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* LINHA 2: Tom e Tamanho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tom de Voz</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as PostTone)}
                className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all hover:border-slate-700"
              >
                {Object.values(PostTone).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tamanho</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as PostLength)}
                className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 transition-all hover:border-slate-700"
              >
                <option value="SHORT">Curto (Post Rápido)</option>
                <option value="MEDIUM">Médio (Padrão)</option>
                <option value="LONG">Longo (Artigo/Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* LINHA 3: GitHub (Input e Botão Lado a Lado) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Link do Repositório (GitHub)
            </label>

            {/* Container Flex para colocar um do lado do outro com espaçamento (gap-3) */}
            <div className="flex items-start gap-3">

              {/* O Input toma todo o espaço restante (flex-1) */}
              <div className="relative group flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Link2 size={18} />
                </div>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/usuario/projeto"
                  // Mantém o estilo dos outros inputs
                  className="w-full bg-[#0a101f]/80 border border-slate-800/80 rounded-lg p-3 pl-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-slate-700"
                />
              </div>

              {/* O botão fica com tamanho fixo ao lado */}
              <div className="flex-none">
                {/* Dependendo de como o componente RepoSelector foi feito, talvez precise de um pequeno ajuste de margem aqui, ex: className="-mt-1" se ele parecer desalinhado verticalmente */}
                <RepoSelector onSelect={(url) => setRepoUrl(url)} />
              </div>
            </div>
          </div>

        </div>

        {/* 🔵 COLUNA DA DIREITA (4/12): Apenas Upload (Mais alto e limpo) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-[300px] lg:min-h-0">
          <div className="flex-1 flex flex-col space-y-2 h-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anexos de Referência</label>

            {/* Input invisível fora do fluxo visual */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleInputChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,image/*"
            />

            <div
              // Eventos conectados
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()} // Transfere o clique para o input

              // Estilização dinâmica
              className={`
                        flex-1 w-full h-full border border-dashed rounded-xl flex flex-col items-center justify-center transition-all p-6 text-center cursor-pointer
                        ${isDragging
                  ? 'border-blue-500 bg-blue-500/20' // Estilo quando arrasta por cima
                  : 'bg-[#0a101f]/30 border-slate-800 hover:border-blue-500/50 hover:bg-[#0a101f]/50' // Estilo normal
                }
                      `}
            >
              <div className={`p-4 bg-slate-900/50 rounded-full mb-4 transition-transform shadow-lg shadow-blue-900/10 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-sm font-bold text-slate-300">
                {isDragging ? "Solte para enviar" : "Arraste arquivos aqui"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Imagens, PDFs, Docs</p>
            </div>

            {/* GALERIA DE ARQUIVOS (GRID) */}
            {filesData.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4 animate-fade-in">
                {filesData.map((file, index) => {
                  const isImage = file.mimeType.startsWith('image/');
                  const extension = file.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'DOC';

                  return (
                    <div
                      key={index}
                      className="relative group w-16 h-16" // Tamanho fixo para o quadrado
                      title={file.name} // Tooltip nativo com o nome do arquivo
                    >

                      {/* --- CONTEÚDO (IMAGEM OU ÍCONE) --- */}
                      {isImage ? (
                        <img
                          src={file.base64}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-sm border border-slate-700 shadow-sm bg-slate-900"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a101f] rounded-xl border border-slate-700 text-slate-500 shadow-sm">
                          {/* Ícone menor para caber no quadrado */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                          {/* Extensão do arquivo (PDF, TXT) */}
                          <span className="text-[8px] font-bold mt-1">{extension}</span>
                        </div>
                      )}

                      {/* --- BOTÃO DE REMOVER (BADGE NO CANTO) --- */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="
                                  absolute -top-2 -right-2 z-10
                                  h-5 w-5 rounded-full
                                  bg-grey-500 text-white
                                  flex items-center justify-center
                                  shadow-md hover:bg-red-800 hover:scale-110 transition-all
                                  cursor-pointer
                                "
                        title="Remover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
          className={`w-full sm:w-auto px-12 py-3.5 rounded-lg font-bold transition-all shadow-2xl flex items-center justify-center gap-3 ${loading || context.length < 5
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

      {/* --- ÁREA DE RESULTADO (CARD ATUALIZADO) --- */}
      {(currentPost || loading) && (
        <section ref={resultRef} className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">

          {loading ? (
            /* LOADING CARD */
            <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-8 shadow-2xl text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-blue-400 mb-8">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <h3 className="text-lg font-bold tracking-tight">A Inteligência Artificial está escrevendo...</h3>
              </div>
              <div className="space-y-4 animate-pulse max-w-2xl">
                <div className="h-4 bg-slate-800/40 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800/40 rounded w-full"></div>
                <div className="h-4 bg-slate-800/40 rounded w-5/6"></div>
              </div>
            </div>
          ) : (
            /* RESULT CARD COM REFINAMENTO */
            currentPost && (
              <div className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-800/50">

                {/* HEADER DO CARD (Ações) */}
                <div className="bg-[#0a101f] border-b border-slate-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Post Gerado</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Pronto para edição</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* BOTÃO SALVAR (NOVO) */}
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="px-4 py-2 bg-slate-800 hover:bg-green-600/20 text-slate-300 hover:text-green-400 text-xs font-bold rounded-lg transition-all flex items-center gap-2 border border-slate-700 hover:border-green-500/50 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "SALVANDO..." : "SALVAR"}
                    </button>

                    {/* BOTÃO COPIAR */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentPost.content);
                        alert("Conteúdo copiado!");
                      }}
                      className="group px-4 py-2 bg-slate-800/50 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 border border-slate-700 hover:border-blue-500"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      COPIAR
                    </button>
                  </div>
                </div>

                {/* TEXTAREA EDITÁVEL */}
                <div className="bg-[#0a101f]/40 p-0 border-b border-slate-800">
                  <textarea
                    value={currentPost.content}
                    onChange={(e) => handleContentEdit(e.target.value)}
                    className="w-full min-h-[400px] bg-transparent border-none focus:ring-0 text-slate-300 text-[15px] leading-relaxed resize-y outline-none font-light p-6 md:p-8 placeholder:text-slate-700"
                    spellCheck={false}
                    placeholder="O texto gerado aparecerá aqui..."
                  />
                </div>

                {/* BARRA MÁGICA DE REFINAMENTO (Footer do Card - NOVO) */}
                <div className="bg-[#0a101f] p-4">
                  <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Wand2 className="w-3 h-3" /> Refinamento com IA
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                      placeholder="Ex: Deixe mais curto, Adicione emojis, Foque mais no código..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600 transition-all"
                    />
                    <button
                      onClick={handleRefine}
                      disabled={refining || !refineInstruction}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-900/20"
                    >
                      {refining ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      Refinar
                    </button>
                  </div>
                </div>

              </div>
            )
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
  );
};

export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#020617]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <GeneratorContent />
    </Suspense>
  );
}