"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowRight, User, Target } from "lucide-react";

interface WelcomeModalProps {
  userId: string;
  onComplete: (name: string) => void; // Avisa o layout que terminou
}

export default function WelcomeModal({ userId, onComplete }: WelcomeModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Trabalho"); // Valor padrão
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Por favor, diga como podemos te chamar!");

    setLoading(true);

    try {
      // Atualiza a tabela 'profiles'
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          usage_type: goal, // Usando a coluna que você já tem!
        })
        .eq("id", userId);

      if (error) throw error;

      // Sucesso! Avisa o pai para fechar o modal e atualizar o nome
      onComplete(name);

    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">

      {/* Card do Modal */}
      <div className="w-full max-w-md bg-[#0f172a] border border-blue-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

        {/* Efeito de Luz de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 text-center">

          <div className="p-10 mb-2">
            <img src="/WideLogo.png" alt="TechPost Logo"/>
          </div>


          <h2 className="text-2xl font-bold text-white mb-2">Boas-vindas ao TechPost!</h2>
          <p className="text-slate-400 mb-8 text-sm">
            Vamos personalizar sua experiência!
          </p>

          <div className="space-y-4 text-left">

            {/* Input Nome */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block pl-1">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fulano da Silva"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Select Objetivo */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block pl-1">Qual seu objetivo?</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Trabalho">🚀 Uso Profissional / Trabalho</option>
                  <option value="Estudos">🎓 Estudos / Acadêmico</option>
                  <option value="Hobby">🎨 Hobby / Projetos Pessoais</option>
                  <option value="Criador">📹 Criação de Conteúdo</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Salvando..." : (
                <>
                  COMEÇAR AGORA <ArrowRight size={18} />
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}