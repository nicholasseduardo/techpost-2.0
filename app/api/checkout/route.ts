import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Verificar quem é o usuário (Autenticação do Supabase)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Receber dados do Frontend (IMPORTANTE: O Asaas pede CPF)
    // Se você não estiver enviando CPF do front ainda, use um CPF gerado de teste para a Sandbox por enquanto.
    const body = await req.json().catch(() => ({})); 
    const { cpf } = body; 

    // URL base muda se for produção ou sandbox (controlado pelo .env)
    const API_URL = process.env.ASAAS_API_URL;
    const API_KEY = process.env.ASAAS_API_KEY;

    // 3. Criar (ou identificar) o Cliente no Asaas
    // O Asaas precisa de um ID de cliente para gerar cobrança
    const customerResponse = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY!
      },
      body: JSON.stringify({
        name: user.user_metadata.full_name || 'Cliente TechPost',
        email: user.email,
        cpfCnpj: cpf || '00000000000', // Fallback apenas para Sandbox se não vier CPF
        externalReference: user.id // Guarda o ID do Supabase no cadastro do cliente
      })
    });

    const customerData = await customerResponse.json();

    if (customerData.errors) {
      console.error("Erro ao criar cliente Asaas:", customerData.errors);
      return NextResponse.json({ error: customerData.errors[0].description }, { status: 400 });
    }

    // 4. Criar a Cobrança (O Checkout)
    const paymentResponse = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY!
      },
      body: JSON.stringify({
        customer: customerData.id, // ID que acabamos de criar acima
        billingType: 'UNDEFINED', // 'UNDEFINED' deixa o usuário escolher PIX ou Boleto na tela do Asaas
        value: 14.90, // Valor do seu plano
        dueDate: new Date().toISOString().split('T')[0], // Vencimento hoje
        description: "Assinatura TechPost VIP",
        externalReference: user.email, // O TRUQUE: Mandamos o email para o Webhook ler depois e liberar o acesso
        postalService: false // Desabilita envio de correio físico (importante!)
      })
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.errors) {
      console.error("Erro ao criar cobrança Asaas:", paymentData.errors);
      return NextResponse.json({ error: paymentData.errors[0].description }, { status: 400 });
    }

    // 5. Devolve a URL de pagamento ("invoiceUrl" é a página de checkout do Asaas)
    return NextResponse.json({ url: paymentData.invoiceUrl });

  } catch (err: any) {
    console.error("Erro interno:", err);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}