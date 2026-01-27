import Link from "next/link";
import { ArrowRight, CheckCircle2, Terminal, Zap, Code2, FileCode, Github, Linkedin, Sparkles, MoveRight, MoveDown, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden selection:bg-blue-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Deixei vazio aqui pois a logo principal agora está no meio da tela, 
              mas você pode colocar uma logo pequena aqui depois se quiser */}
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          </div>

          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors py-2"
            >
              Login
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
            >
              Testar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        {/* Efeitos de Fundo (Glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50" />
        
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <div className="flex justify-center mb-25">
            <img src="/WideLogo.png" alt="TechPost Logo" className="h-60 w-auto object-contain" />
          </div>

          {/* Título (Reduzi um pouco o tamanho para text-4xl no mobile e text-6xl no desktop) */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Transforme seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">projetos</span> em autoridade nas redes sociais.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A ferramenta de IA que escreve posts técnicos virais baseados nos seus repositórios, PDFs ou ideias.
          </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                <Link 
                    href="/login"
                    className="relative group w-full md:w-auto px-15 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    <span className="relative flex items-center gap-2">
                    Criar meu 1º Post Grátis
                    </span>
                </Link>
            </div>
        </div>
      </section>


      {/* --- DEMO / FLUXOGRAMA MINIMALISTA V3 (Final) --- */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* TÍTULO DA SEÇÃO */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Como Funciona
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Simples, rápido e direto ao ponto. Do seu código para o LinkedIn em segundos.
            </p>
          </div>

          <div className="mt-10 mb-20 relative w-full rounded-xl shadow-2xl border border-gray-800 bg-gray-900/50 p-2 backdrop-blur-sm animate-fade-in-up">
            <video
              className="w-full rounded-lg shadow-lg"
              autoPlay
              muted
              loop
              playsInline // Essencial para iPhone
              webkit-playsinline="true" // Adicione essa linha extra para garantir suporte em iOS antigo
              controls 
              poster="/thumbnail-video2.jpg" // 👈 A SALVAÇÃO: Imagem de capa
              preload="metadata" // Carrega só o básico primeiro pra não travar o site
            >
              <source src="/demo.mp4" type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
            
            {/* LINHA DE CONEXÃO (Background) */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-y-1/2 hidden md:block z-0"></div>

            {/* === COLUNA ESQUERDA: INPUTS === */}
            <div className="relative z-10 flex flex-row gap-6 md:flex-col md:gap-12 bg-[#020617] p-4 rounded-xl border border-white/5 md:border-0">
              
              {/* Input 1: GitHub */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-blue-500/50 group-hover:shadow-blue-500/20 transition-all duration-300 relative">
                  <Github size={28} className="text-slate-400 group-hover:text-white transition-colors" />
                  <div className="absolute -top-2 -right-2 bg-slate-800 border border-slate-700 p-1.5 rounded-lg">
                    <FileCode size={14} className="text-blue-400" />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400 transition-colors">SEUS DOCUMENTOS</span>
              </div>

              {/* Input 2: Contexto */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-amber-500/50 group-hover:shadow-amber-500/20 transition-all duration-300 relative">
                  <FileText size={28} className="text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-mono text-slate-500 group-hover:text-amber-400 transition-colors">CONTEXTO EXTRA</span>
              </div>
            </div>

            {/* SETA MOBILE */}
            <div className="md:hidden text-slate-600 animate-bounce">
               <MoveDown size={24} />
            </div>

            {/* === CENTRO: O CÉREBRO (IA) === */}
            <div className="relative z-10 flex flex-col items-center gap-4 bg-[#020617] p-4">
              <div className="relative w-50 h-50 flex items-center justify-center">
                {/* Halo de energia maior para conectar visualmente */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse ml-[-20%] w-[140%]"></div>
                
                <div className="w-45 h-30 bg-slate-950 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-500/30 z-20 relative overflow-hidden group p-4">
    
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10" />
                    
                    <img 
                        src="/WideLogo.png" 
                        alt="TechPost Logo" 
                        // Mudei para 'w-full h-full' para ela se ajustar dentro do padding sem vazar
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    />
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold tracking-widest uppercase animate-pulse">
                <Zap size={16} className="fill-blue-400" />
                Processamento
              </div>
            </div>


            {/* SETA MOBILE */}
            <div className="md:hidden text-slate-600 animate-bounce">
               <MoveDown size={24} />
            </div>

            {/* === DIREITA: OUTPUT === */}
            <div className="relative z-10 flex flex-col items-center gap-3 bg-[#020617] p-4 rounded-xl border border-white/5 md:border-0">
              <div className="w-24 h-24 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center shadow-lg hover:border-emerald-500/50 hover:shadow-emerald-500/20 transition-all duration-300 relative group">
                <Linkedin size={40} className="text-slate-400 group-hover:text-white transition-colors" />
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500 font-bold mt-2">POST PRONTO</span>
            </div>

          </div>
        </div>
      </section>


      {/* --- FEATURES & FINAL CTA --- */}
      <section className="py-24 bg-[#020617] border-t border-white/5 relative overflow-hidden">
        
        {/* Glow de fundo sutil para dar profundidade */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-6xl mx-auto px-6">
          
          {/* Título da Seção (Opcional, ajuda na organização) */}
          <div className="text-center mb-16">
             <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
               Por que usar o TechPost IA?
             </h2>
          </div>

          {/* GRID DE CARDS */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <FeatureCard 
              icon={<Code2 size={28} className="text-blue-400" />}
              title="Entende seu Código"
              desc="Cole arquivos de pdf ou imagens. Nossa IA analisa a lógica e enriquece o seu texto para gerar mais autoridade!"
            />
            <FeatureCard 
              icon={<Zap size={28} className="text-amber-400" />}
              title="Personalize seu post"
              desc="Com poucos cliques, defina seu público alvo, tamanho do texto, tom da escrita, rede social e receba um texto otimizado para cada variável!"
            />
            <FeatureCard 
              icon={<CheckCircle2 size={28} className="text-emerald-400" />}
              title="Linguagem otimizada"
              desc="Hooks virais, expressões naturais e Call to Actions (CTA) otimizados para engajar o seu público."
            />
          </div>

          {/* --- BLOCO FINAL DE CTA (CHAMADA PARA AÇÃO) --- */}
          <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 text-center border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950">
            
            {/* Efeitos de Fundo do Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Economize seu tempo e <br className="hidden md:block"/>
                <span className="text-blue-500">comece a postar com frequência.</span>
              </h2>
              
              <p className="text-slate-400 text-lg mb-10 max-w-2xl">
                Junte-se a outros profissionais que estão construindo autoridade técnica e enriqueça seu perfil sem perder horas do seu dia.
              </p>

              {/* O BOTÃO PODEROSO */}
              <Link 
                href="/login" 
                className="relative group px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xl font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <span className="relative flex items-center gap-2">
                  Gerar Post Grátis 
                </span>
              </Link>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

// Componente FeatureCard Atualizado (Mais Premium)
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 group hover:-translate-y-2 backdrop-blur-sm">
      <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-white/10 w-fit group-hover:scale-110 group-hover:border-blue-500/20 group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}