"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Interface simplificada para o novo layout de Menu
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string;    
  onLogout?: () => void;  
  isVip: boolean;
  usageCount?: number;
  fullName?: string; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  userEmail, 
  onLogout,
  usageCount = 0, 
  isVip,
  fullName 
}) => {
  const pathname = usePathname();

  // --- FUNÇÃO DE INICIAIS ---
  const getInitials = (name: string) => {
    // Se não tiver nome, tenta pegar do email, senão devolve "TP"
    const source = name || userEmail || "TP";
    
    // Remove espaços extras e divide
    const parts = source.trim().split(" ");
    
    // Se for só um nome (ex: "Nicholas"), pega as 2 primeiras letras
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    // Se tiver sobrenome, pega a primeira letra do primeiro e do último nome
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Itens do Menu (Baseado nos seus prints)
  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )
    },
    { 
      name: "Gerar textos", 
      href: "/dashboard/gerar", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      )
    },
    { 
      name: "Minhas Postagens", 
      href: "/dashboard/posts", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      )
    },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black z-40 lg:hidden backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[60]           
        w-64 
        h-[100dvh] lg:h-screen                  
        bg-[#020617] lg:bg-[#050a1f]/40        
        backdrop-blur-md border-r border-white/5 flex flex-col 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* LOGO */}
        <div className="p-8 mb-2">
           <img src="/WideLogo.png" alt="TechPost Logo" className="h-20 w-auto object-contain" />
        </div>

        {/* MENU DE NAVEGAÇÃO (NOVO) */}
        <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose} // Fecha sidebar no mobile ao clicar
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm
                            ${isActive 
                                ? "bg-tech-highlight text-white shadow-[0_0_15px_rgba(29,78,216,0.5)] border border-blue-400/20" 
                                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                            }
                        `}
                    >
                        <span className={isActive ? "text-white" : "text-gray-500 group-hover:text-white transition-colors"}>
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                );
            })}
        </nav>

        {/* FOOTER: VIP & PERFIL */}
        <div className="p-4 border-t border-white/10 mt-auto bg-tech-sidebar">
          
          {/* Card VIP Dinâmico */}
          <Link href="/dashboard/perfil">
             <div className="mb-4 group cursor-pointer">
                <div className={`
                    p-3 rounded-xl border transition-all duration-300 relative overflow-hidden
                    ${isVip 
                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-900/20 border-amber-500/30 group-hover:border-amber-500/50' 
                        : 'bg-slate-900/50 border-slate-800 group-hover:bg-slate-800'
                    }
                `}>
                    {/* Efeito de brilho se for VIP */}
                    {isVip && <div className="absolute inset-0 bg-amber-500/5 blur-xl"></div>}

                    <div className="flex items-center gap-3 relative z-10">
                        {/* CÍRCULO COM INICIAIS (ALTERADO) */}
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
                            ${isVip 
                                ? 'bg-gradient-to-br from-amber-400 to-amber-700 text-black' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }
                        `}>
                            {/* Chama a função que criamos */}
                            {getInitials(fullName || "")}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            {/* NOME DO USUÁRIO (ALTERADO) */}
                            <p className="text-sm font-bold text-white truncate">
                                {fullName || userEmail?.split('@')[0] || "Usuário"}
                            </p>
                            
                            {/* STATUS (ALTERADO) */}
                            <div className="flex items-center gap-1.5">
                                {isVip && <span className="text-[10px]">👑</span>}
                                <p className={`text-[10px] uppercase tracking-wider font-semibold ${isVip ? 'text-amber-500' : 'text-slate-500'}`}>
                                    {isVip ? 'Membro VIP' : 'Conta Gratuita'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progresso (só para Free) */}
                    {!isVip && (
                        <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${(usageCount / 2) * 100}%` }}
                            />
                        </div>
                    )}
                </div>
             </div>
          </Link>

          {/* Botão Logout */}
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;