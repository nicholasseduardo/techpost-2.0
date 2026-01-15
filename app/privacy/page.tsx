import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-400 hover:underline text-sm mb-8 block">← Voltar para a Home</Link>
        
        <h1 className="text-3xl font-bold text-white mb-4">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-8">Última atualização: Janeiro de 2026</p>

        <div className="space-y-4 text-justify leading-relaxed">
          <p>A sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos seus dados.</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">1. Coleta de Dados</h2>
          <p>Coletamos informações necessárias para o funcionamento do serviço, como e-mail (para login) e dados de uso da plataforma.</p>

          <h2 className="text-xl font-semibold text-white mt-6">2. Uso de Dados</h2>
          <p>Não vendemos seus dados para terceiros. Utilizamos as informações apenas para melhorar a experiência do usuário e processar pagamentos via Stripe.</p>

           {/* Adicione mais cláusulas aqui conforme necessário */}
        </div>
      </div>
    </div>
  );
}