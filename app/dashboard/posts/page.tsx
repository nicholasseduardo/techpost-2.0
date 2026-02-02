"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Tipos atualizados
type ColumnId = "idea" | "draft" | "published";

interface Post {
    id: string;
    title: string;
    preview: string;
    column: ColumnId;
    date: string;
    tags: string[];
}

export default function PostsPage() {
  const router = useRouter(); // <--- Hook de navegação
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((post: any) => ({
          id: post.id,
          title: post.title || "Sem título", 
          preview: post.generated_text ? post.generated_text.substring(0, 120) + "..." : "Sem conteúdo...",
          column: post.status || "draft",
          date: new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          tags: [post.tone, post.audience].filter(Boolean).map((t: string) => t.toUpperCase()) 
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: ColumnId) => {
    e.preventDefault();
    if (!draggedPostId) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === draggedPostId ? { ...post, column: targetColumn } : post
      )
    );
    setDraggedPostId(null);

    try {
        await supabase.from('posts').update({ status: targetColumn }).eq('id', draggedPostId);
    } catch (error) { console.error(error); }
  };

  // --- Função de Navegação ---
  const handleCardClick = (postId: string) => {
      // Redireciona para a página de edição com o ID na URL
      router.push(`/dashboard/gerar?id=${postId}`);
  };

  // ... (handleDragStart, End, Over iguais) ...
  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedPostId(postId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { (e.target as HTMLElement).classList.add('opacity-50'); }, 0);
  };
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedPostId(null);
    (e.target as HTMLElement).classList.remove('opacity-50');
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const getPostsByColumn = (column: ColumnId) => posts.filter((p) => p.column === column);

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">Minhas Postagens</h1>
            <p className="text-slate-400 text-sm">Gerencie seu fluxo de conteúdo: da ideia à publicação.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 opacity-70 cursor-not-allowed">
            <span>+</span> Nova Ideia
        </button>
      </header>

      {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 gap-2">Carregando...</div>
      ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
            <KanbanColumn 
                title="💡 Ideias" columnId="idea" color="border-yellow-500/50" bg="bg-yellow-500/5"
                posts={getPostsByColumn("idea")}
                onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                onCardClick={handleCardClick} // <--- Passando a função nova
            />
            <KanbanColumn 
                title="✍️ Rascunhos" columnId="draft" color="border-blue-500/50" bg="bg-blue-500/5"
                posts={getPostsByColumn("draft")}
                onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                onCardClick={handleCardClick}
            />
            <KanbanColumn 
                title="🚀 Publicado" columnId="published" color="border-green-500/50" bg="bg-green-500/5"
                posts={getPostsByColumn("published")}
                onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                onCardClick={handleCardClick}
            />
          </div>
      )}
    </div>
  );
}

// --- Componente Auxiliar Atualizado ---
interface KanbanColumnProps {
    title: string; columnId: ColumnId; color: string; bg: string; posts: Post[];
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, col: ColumnId) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onCardClick: (id: string) => void; // <--- Nova Prop
}

function KanbanColumn({ title, columnId, color, bg, posts, onDragOver, onDrop, onDragStart, onDragEnd, onCardClick }: KanbanColumnProps) {
    return (
        <div 
            className={`flex flex-col h-full rounded-2xl border border-slate-800/50 ${bg} min-w-[280px]`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, columnId)}
        >
            <div className={`p-4 border-b border-slate-800/50 flex items-center justify-between`}>
                <h3 className="font-bold text-slate-200">{title}</h3>
                <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{posts.length}</span>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {posts.map(post => (
                    <div
                        key={post.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, post.id)}
                        onDragEnd={onDragEnd}
                        onClick={() => onCardClick(post.id)} // <--- Evento de Clique aqui!
                        className={`
                            group bg-[#0f172a] border border-slate-800 p-4 rounded-xl cursor-pointer active:cursor-grabbing 
                            shadow-sm hover:shadow-md hover:border-slate-600 transition-all hover:-translate-y-1 relative overflow-hidden
                        `}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-[10px] text-slate-500 font-mono">{post.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 pl-2 leading-tight">{post.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 pl-2 mb-3">{post.preview}</p>
                        <div className="flex flex-wrap gap-2 pl-2">
                            {post.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[9px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}