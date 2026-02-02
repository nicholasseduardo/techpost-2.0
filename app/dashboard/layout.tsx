"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import WelcomeModal from "../components/WelcomeModal"; // <--- 1. IMPORT NOVO

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Estados de Dados
  const [userId, setUserId] = useState<string | null>(null); // Guardar ID
  const [isVip, setIsVip] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Estado do Modal (Novo)
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsVip(profile.is_vip || false);
        setUsageCount(profile.usage_count || 0);

        // Lógica do Modal: Se NÃO tiver nome, mostra o modal
        if (profile.full_name) {
          setFullName(profile.full_name);
        } else {
          setShowWelcome(true); // <--- ATIVA O MODAL SE NÃO TIVER NOME
        }
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Função chamada quando o usuário termina o cadastro no Modal
  const handleWelcomeComplete = (newName: string) => {
    setFullName(newName); // Atualiza o nome na Sidebar instantaneamente
    setShowWelcome(false); // Fecha o modal
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] overflow-hidden relative">

      {/* 2. RENDERIZA O MODAL SE NECESSÁRIO */}
      {showWelcome && userId && (
        <WelcomeModal userId={userId} onComplete={handleWelcomeComplete} />
      )}

      {/* Background Orbs */}
      <div className="absolute top-[-40%] right-[-30%] w-[1000px] h-[1000px] bg-blue-900/70 rounded-full blur-[240px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-[70%] right-[80%] w-[400px] h-[400px] bg-blue-500/100 rounded-full blur-[160px] pointer-events-none z-0 mix-blend-screen" />

      {/* Sidebar */}
      <div className="relative z-20 h-full flex-none"> 
        <Sidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            isVip={isVip}
            usageCount={usageCount}
            userEmail={userEmail}
            fullName={fullName} 
        />
      </div>

      <main className="flex-1 h-full overflow-y-auto relative z-10 flex flex-col scroll-smooth">

        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-[#050a1f]/80 backdrop-blur-md sticky top-0 z-50">
          <span className="font-bold text-white">TechPost</span>
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
        <footer className="p-8 border-t border-slate-800/50 mt-auto bg-[#020617]/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; 2026 TechPost IA. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="/terms" className="hover:text-blue-400 transition-colors">Termos</a>
              <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacidade</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}