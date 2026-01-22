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
          <p className="text-slate-500 text-sm">Última atualização: 22 de Janeiro de 2026</p>
        </header>

        <div className="space-y-8 text-justify leading-relaxed text-slate-300">
          
          <section>
            <p>
              Bem-vindo ao <strong>TechPost IA</strong>. Ao criar uma conta ou utilizar nossos serviços, você concorda com os termos descritos abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Do Serviço e Responsabilidade</h2>
            <p>
              O TechPost IA é um SaaS (Software as a Service) que utiliza Inteligência Artificial para auxiliar na criação de conteúdo técnico.
            </p>
            <p className="mt-2 text-slate-400 text-sm italic border-l-2 border-blue-500 pl-4">
              <strong>Isenção de IA:</strong> A Inteligência Artificial pode cometer erros ("alucinações") ou gerar informações imprecisas. O usuário é o <strong>único responsável</strong> por revisar, editar e verificar a veracidade das informações antes de publicá-las. <strong>O TechPost IA não se responsabiliza por danos decorrentes do uso de conteúdo gerado pela plataforma sem a devida revisão.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Planos, Pagamentos e Cancelamento</h2>
            <div className="space-y-4">
              
              {/* ASSINATURA E RECORRÊNCIA */}
              <div>
                <h3 className="text-white font-medium">Assinatura Mensal (Recorrência)</h3>
                <p>
                  O Plano PRO opera no modelo de <strong>assinatura com renovação automática</strong>. Ao contratar, você autoriza a cobrança recorrente do valor vigente na forma de pagamento escolhida (Pix, Boleto ou Cartão). A assinatura permanecerá ativa e as cobranças continuarão ocorrendo mensalmente até que o cancelamento seja solicitado pelo usuário.
                </p>
              </div>

              {/* PROCESSAMENTO DE DADOS */}
              <div>
                <h3 className="text-white font-medium">Processamento de Pagamentos</h3>
                <p>
                  Para segurança e emissão de notas fiscais, os pagamentos são processados pelo gateway parceiro <strong>Asaas</strong>. O TechPost IA coleta dados estritamente necessários (CPF, Nome, Email) para a formalização da transação, conforme exigido pela legislação fiscal brasileira.
                </p>
              </div>

              {/* REEMBOLSO E CANCELAMENTO */}
              <div>
                <h3 className="text-white font-medium">Direito de Arrependimento e Cancelamento</h3>
                <p>
                  <strong>Garantia de 7 Dias:</strong> Conforme o Art. 49 do Código de Defesa do Consumidor, o usuário tem o prazo de 7 (sete) dias corridos, contados a partir da <em>primeira assinatura</em>, para solicitar o cancelamento com reembolso total imediato.
                </p>
                <p className="mt-2">
                  <strong>Cancelamento da Recorrência:</strong> Passado o prazo de 7 dias, o usuário pode solicitar o cancelamento da assinatura a qualquer momento enviando um e-mail para <span className="text-blue-400">techpost.ia@gmail.com</span>. O cancelamento interromperá cobranças futuras (próximos meses), mas não haverá reembolso proporcional do mês já vigente/pago.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Propriedade Intelectual</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Conteúdo Gerado:</strong> Todo o texto gerado pela plataforma pertence ao usuário. O usuário tem o direito comercial total sobre o conteúdo que criar na plataforma.</li>
              <li><strong>Nossa Plataforma:</strong> O código-fonte, design, marca "TechPost IA" e infraestrutura pertencem exclusivamente aos desenvolvedores do TechPost IA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Uso Aceitável</h2>
            <p>
              É estritamente proibido usar o TechPost IA para gerar conteúdo ilegal, discriminatório, discurso de ódio, fake news ou qualquer material que viole leis locais ou internacionais. Reservamo-nos o direito de banir contas que violem esta diretriz sem aviso prévio e sem reembolso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}