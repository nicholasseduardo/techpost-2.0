import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          ← Voltar para a Home
        </Link>
        
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
          <p className="text-slate-500 text-sm">Última atualização: 15 de Janeiro de 2026</p>
        </header>

        <div className="space-y-8 text-justify leading-relaxed text-slate-300">
          
          <section>
            <p>
              A sua privacidade é a prioridade número um do <strong>TechPost IA</strong>. 
              Esta política descreve transparência total sobre como tratamos os dados, arquivos e informações pessoais do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Dados que Coletamos</h2>
            <p>Coletamos apenas o mínimo necessário para o funcionamento do serviço:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li><strong>Identificação:</strong> Nome completo e endereço de e-mail (para criação de conta e login).</li>
              <li><strong>Perfil de Uso:</strong> Informação sobre sua finalidade de uso (ex: Estudante, Profissional, Criador) para estatística interna e personalização futura da experiência do usuário.</li>
              <li><strong>Dados de Pagamento:</strong> Processados inteiramente pela plataforma de pagamentos Stripe. Nós <strong>não</strong> temos acesso nem armazenamos os números do seu cartão de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Tratamento de Arquivos e IA</h2>
            <p>
              O diferencial do TechPost IA é a análise de documentos. Para isso, utilizamos a tecnologia de inteligência artificial do Google Gemini.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-3">
              <p className="font-semibold text-blue-400 mb-2">Sobre os arquivos do usuário (PDFs, Imagens):</p>
              <p className="text-sm">
                Nós adotamos uma política de <strong>processamento transitório</strong>. Quando o usuário faz upload de um arquivo, ele é enviado diretamente para a API de Inteligência Artificial para leitura e interpretação. 
                <strong> Nós não armazenamos seus arquivos permanentemente em nosso banco de dados.</strong> Após o processamento e a geração do post, o arquivo não é mantido em nossos servidores.
                Mantemos apenas informações de <strong>contexto, texto gerado e título</strong> guardadas em um banco de dados para que o usuário consiga acessar seu histórico de textos gerados.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Compartilhamento com Terceiros</h2>
            <p>Não vendemos seus dados. Compartilhamos informações apenas com os serviços essenciais para a operação da plataforma:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li><strong>Supabase:</strong> Para autenticação segura e armazenamento do histórico de textos gerados pelo usuário.</li>
              <li><strong>Google (Gemini AI):</strong> Para processamento de inteligência artificial e geração de texto.</li>
              <li><strong>Stripe:</strong> Para processamento seguro de pagamentos.</li>
              <li><strong>Vercel:</strong> Para hospedagem da infraestrutura do site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Seus Direitos</h2>
            <p>
              O usuário tem total controle sobre seus dados. A qualquer momento, ele pode solicitar a exclusão completa da sua conta e de todo o histórico de posts gerados entrando em contato conosco através do nosso e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contato</h2>
            <p>
              Para solicitações de exclusão de dados, dúvidas ou suporte, o usuário deve entrar em contato conosco através do e-mail oficial:
            </p>
            <a href="mailto:techpost.ia@gmail.com" className="text-blue-400 hover:underline mt-2 block font-medium">
              techpost.ia@gmail.com
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}