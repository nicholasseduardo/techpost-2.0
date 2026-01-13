
import React from 'react';
import { GeneratedPost } from '../types';

interface SidebarProps {
  posts: GeneratedPost[];
  onNewPost: () => void;
  onSelectPost: (post: GeneratedPost) => void;
  currentPostId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string;    
  onLogout?: () => void;  
}

const Sidebar: React.FC<SidebarProps> = ({ 
  posts, 
  onNewPost, 
  onSelectPost, 
  currentPostId, 
  isOpen, 
  onClose,
  userEmail, 
  onLogout 
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050505] border-r border-slate-900 flex flex-col h-screen 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          
          {/* HEADER: LOGO E FECHAR */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="TechPost Logo" className="h-15 w-auto object-contain" />
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* BOTÃO NOVO POST */}
          <button 
            onClick={() => { onNewPost(); onClose?.(); }}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2.5 transition-all font-bold text-sm shadow-lg shadow-blue-900/20 border border-blue-500/50 hover:-translate-y-0.5"
          >
            <span className="text-xl font-light leading-none">+</span> NOVO POST
          </button>

          {/* LISTA DE HISTÓRICO */}
          <div className="flex-1 overflow-y-auto mt-8 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <div className="flex items-center gap-2 text-slate-500 mb-4 px-2">
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">Histórico Recente</span>
            </div>

            <div className="space-y-1">
              {posts.length === 0 ? (
                <p className="text-xs text-slate-600 px-4 py-8 text-center border border-dashed border-slate-800 rounded-lg mx-2">
                  Seu histórico aparecerá aqui.
                </p>
              ) : (
                posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => { onSelectPost(post); onClose?.(); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all truncate border group relative ${
                      currentPostId === post.id 
                      ? 'bg-blue-900/10 text-blue-400 border-blue-500/20 font-semibold' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    {post.topic || 'Sem título'}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* FOOTER: PERFIL E LOGOUT */}
          <div className="pt-4 border-t border-slate-900 mt-4 bg-[#050505]">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner border border-slate-600">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Logado como</p>
                <p className="text-xs font-medium text-slate-300 truncate" title={userEmail}>
                  {userEmail || 'Carregando...'}
                </p>
              </div>
            </div>

            <button 
              onClick={onLogout} // CONECTADO! 🔌
              className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded transition-all text-xs font-bold uppercase tracking-wider border border-transparent hover:border-red-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair da Conta
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
