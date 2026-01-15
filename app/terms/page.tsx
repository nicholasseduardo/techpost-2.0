import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          ← Voltar para a Home
        </Link>
        
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Termos de Uso</h1>
          <p className="text-slate-500 text-sm">Última atualização: 15 de Janeiro de 2026</p>
        </header>

        <div className="space-y-8 text-justify leading-relaxed text-slate-300">
          
          <section>
            <p>
              Bem-vindo ao <strong>TechPost IA</strong>. Ao criar uma conta ou utilizar nossos serviços, você concorda com os termos descritos abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Do Serviço</h2>
            <p>
              O TechPost IA é um SaaS (Software as a Service, Software como Serviço) que utiliza Inteligência Artificial para auxiliar na criação de conteúdo técnico e posts para redes sociais.
            </p>
            <p className="mt-2 text-slate-400 text-sm italic border-l-2 border-blue-500 pl-4">
              <strong>Isenção de IA:</strong> A Inteligência Artificial pode cometer erros ("alucinações"). O usuário é o <strong>único responsável</strong> por revisar, editar e verificar a veracidade das informações antes de publicá-las. <strong>O TechPost IA não se responsabiliza pelo conteúdo final publicado pelo usuário</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Pagamentos e Reembolsos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium">Acesso Vitalício (Lifetime Deal)</h3>
                <p>
                  Oferecemos uma <strong>condição especial temporária</strong> que garante um plano de pagamento único para os 100 primeiros usuários pagantes, fornecendo acesso vitalício às funcionalidades PRO da plataforma, sujeito à disponibilidade contínua do serviço.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium">Política de Reembolso (7 Dias)</h3>
                <p>
                  Garantimos a satisfação do usuário. Se ele não estiver satisfeito com o TechPost IA, poderá solicitar o reembolso integral do valor pago em até <strong>7 (sete) dias corridos</strong> após a confirmação da compra.
                </p>
                <p className="mt-1">Para solicitar o reembolso, o usuário deve enviar um e-mail para <span className="text-blue-400">techpost.ia@gmail.com</span>.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Propriedade Intelectual</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Posts do usuário:</strong> Todo o texto gerado pela plataforma pertence ao usuário. Ele tem o direito comercial total sobre o conteúdo criado.</li>
              <li><strong>Nossa Plataforma:</strong> O código-fonte, design, marca "TechPost IA" e infraestrutura pertencem exclusivamente aos desenvolvedores do TechPost IA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Uso Aceitável</h2>
            <p>
              É estritamente proibido usar o TechPost IA para gerar conteúdo ilegal, discriminatório, discurso de ódio, fake news ou qualquer material que viole leis locais ou internacionais. Reservamo-nos o direito de banir contas que violem esta diretriz sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Notificaremos os usuários sobre mudanças significativas através do e-mail cadastrado ou aviso na plataforma.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}