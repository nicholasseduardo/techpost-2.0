import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-blue-400 hover:underline text-sm mb-8 block">← Voltar para a Home</Link>
        
        <h1 className="text-3xl font-bold text-white mb-4">Termos de Uso</h1>
        <p className="text-sm text-slate-500 mb-8">Última atualização: Janeiro de 2026</p>

        <div className="space-y-4 text-justify leading-relaxed">
          <p>Bem-vindo ao TPost. Ao acessar e usar nosso site, você concorda em cumprir os seguintes termos...</p>
          
          <h2 className="text-xl font-semibold text-white mt-6">1. Uso do Serviço</h2>
          <p>O TPost é uma ferramenta de IA para geração de conteúdo. O usuário é responsável pelo conteúdo gerado e como ele é utilizado.</p>

          <h2 className="text-xl font-semibold text-white mt-6">2. Contas e Assinaturas</h2>
          <p>Para acessar recursos PRO, é necessária uma assinatura ativa. O cancelamento pode ser feito a qualquer momento...</p>

          {/* Adicione mais cláusulas aqui conforme necessário */}
        </div>
      </div>
    </div>
  );
}