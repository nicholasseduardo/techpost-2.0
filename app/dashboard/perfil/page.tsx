"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Zap, LogOut, Calendar, ShieldCheck } from "lucide-react";
import { TargetAudience, PostTone, SocialNetwork, PostObjective } from "../../types";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        default_audience: 'Engenheiros', 
        default_tone: 'Profissional',
        default_channel: 'LinkedIn',  
        default_objective: 'Autoridade' 
    });

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setProfile(data);
            if (data) {
        setFormData({
            default_audience: data.default_audience || 'Engenheiros',
            default_tone: data.default_tone || 'Profissional',
            default_channel: data.default_channel || 'LinkedIn',
            default_objective: data.default_objective || 'Autoridade'
        });
    }

            setLoading(false);
        };
        getData();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };


    const handleSavePreferences = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    default_audience: formData.default_audience,
                    default_tone: formData.default_tone,
                    default_channel: formData.default_channel,
                    default_objective: formData.default_objective
                })
                .eq('id', user.id);

            if (error) throw error;
            alert("Preferências atualizadas com sucesso! 💾");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar preferências.");
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                Carregando perfil...
            </div>
        );
    }

    // Lógica de Limites (Sincronizada com o resto do app)
    const isVip = profile?.is_vip || false;
    const usage = profile?.usage_count || 0;
    const limit = 2; // Limite gratuito
    const percentage = Math.min((usage / limit) * 100, 100);

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">

            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                Meu Perfil
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- COLUNA DA ESQUERDA: DADOS PESSOAIS --- */}
                <div className="md:col-span-2 space-y-6">

                    {/* Card Principal */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                        {/* Background Decorativo */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-[#0f172a] z-10">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 text-center sm:text-left z-10">
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                            </h2>
                            <p className="text-slate-400 mb-4">{user?.email}</p>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                                    <Calendar size={14} /> Entrou em {new Date(user?.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- CARD DE PREFERÊNCIAS (FUNCIONAL) --- */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-blue-500">⚙️</span> Preferências de IA
                            </h2>
                            {saving && <span className="text-xs text-green-400 animate-pulse font-bold">SALVANDO...</span>}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* 1. CANAL PADRÃO (NOVO) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Canal / Rede Social</label>
                                    <select 
                                        value={formData.default_channel}
                                        onChange={(e) => setFormData({...formData, default_channel: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    >
                                        {Object.values(SocialNetwork).map((net) => (
                                            <option key={net} value={net} className="bg-[#0f172a]">{net}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 2. OBJETIVO PADRÃO (NOVO) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Objetivo Padrão</label>
                                    <select 
                                        value={formData.default_objective}
                                        onChange={(e) => setFormData({...formData, default_objective: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    >
                                        {Object.values(PostObjective).map((obj) => (
                                            <option key={obj} value={obj} className="bg-[#0f172a]">{obj}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3. PÚBLICO PADRÃO (JÁ EXISTIA) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Público Padrão</label>
                                    <select 
                                        value={formData.default_audience}
                                        onChange={(e) => setFormData({...formData, default_audience: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    >
                                        {Object.values(TargetAudience).map((audience) => (
                                            <option key={audience} value={audience} className="bg-[#0f172a]">{audience}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 4. TOM PADRÃO (JÁ EXISTIA) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tom de Voz Padrão</label>
                                    <select 
                                        value={formData.default_tone}
                                        onChange={(e) => setFormData({...formData, default_tone: e.target.value})}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    >
                                        {Object.values(PostTone).map((tone) => (
                                            <option key={tone} value={tone} className="bg-[#0f172a]">{tone}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* BOTÃO DE SALVAR */}
                            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Salvar Preferências'}
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

                {/* --- COLUNA DA DIREITA: PLANO E USO --- */}
                <div className="flex flex-col gap-6">

                    {/* Card do Plano */}
                    <div className={`
                relative rounded-2xl p-8 border flex flex-col h-full
                ${isVip
                            ? 'bg-gradient-to-b from-[#1a1500] to-[#0f172a] border-amber-500/30'
                            : 'bg-[#0f172a] border-slate-800'
                        }
            `}>
                        {isVip && (
                            <div className="absolute top-0 right-0 p-4">
                                <Zap className="text-amber-500 fill-amber-500/20" size={24} />
                            </div>
                        )}

                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Plano Atual</h3>
                        <div className="mb-6">
                            <span className={`text-3xl font-black ${isVip ? 'text-amber-500' : 'text-white'}`}>
                                {isVip ? 'TECHPOST PRO' : 'Gratuito'}
                            </span>
                        </div>

                        {isVip ? (
                            <div className="flex-1">
                                <p className="text-slate-300 text-sm mb-4">
                                    Você tem acesso <strong>ilimitado</strong> a todas as funcionalidades de IA e geração de conteúdo.
                                </p>
                                <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                    <ShieldCheck size={18} /> Assinatura Ativa
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Gerações Disponíveis</span>
                                        <span className="text-white font-bold">{usage} / {limit}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${percentage >= 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/dashboard/gerar')}
                                    className="w-full mt-auto py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    FAZER UPGRADE AGORA
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botão Sair */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 transition-all py-3 rounded-xl text-sm font-bold"
                    >
                        <LogOut size={18} />
                        Sair da Conta
                    </button>

                </div>

            </div>
        </div>
    );
}