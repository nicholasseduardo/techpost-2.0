import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Verificar quem é o usuário
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Recebe o CPF do Frontend
    const body = await req.json().catch(() => ({})); 
    const { cpf } = body; 

    if (!cpf) {
        return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
    }

    const API_URL = process.env.ASAAS_API_URL;
    const API_KEY = process.env.ASAAS_API_KEY;

    // 3. Criar ou Atualizar Cliente no Asaas
    // (Nota: Em produção, é bom verificar se o cliente já existe pelo email antes de criar, 
    // mas vamos manter criando para garantir que funciona agora).
    const customerResponse = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY!
      },
      body: JSON.stringify({
        name: user.user_metadata.full_name || 'Cliente TechPost',
        email: user.email,
        cpfCnpj: cpf, 
        externalReference: user.id
      })
    });

    const customerData = await customerResponse.json();

    if (customerData.errors) {
      console.error("Erro ao criar cliente Asaas:", customerData.errors);
      // Se der erro de "email já existe", a gente poderia buscar o cliente, mas vamos tratar o erro simples primeiro
      return NextResponse.json({ error: customerData.errors[0].description }, { status: 400 });
    }

    // 4. Criar ASSINATURA (MUDANÇA AQUI) 🔄
    const subscriptionResponse = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY!
      },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'UNDEFINED', // Deixa o usuário escolher Pix ou Boleto na tela do Asaas
        value: 14.90,
        nextDueDate: new Date().toISOString().split('T')[0], // Cobra a primeira HOJE
        cycle: 'MONTHLY', // <--- MÁGICA: Cobrança Mensal
        description: "Assinatura TechPost VIP (Mensal)",
        externalReference: user.id, // ID para o Webhook liberar o acesso
      })
    });

    const subscriptionData = await subscriptionResponse.json();

    if (subscriptionData.errors) {
      console.error("Erro ao criar assinatura Asaas:", subscriptionData.errors);
      return NextResponse.json({ error: subscriptionData.errors[0].description }, { status: 400 });
    }

    // A resposta da assinatura não tem "invoiceUrl" direto, ela cria a primeira cobrança.
    // Mas para facilitar, o Asaas geralmente retorna a URL da fatura atual se pedirmos,
    // ou podemos mandar o usuário para a área de pagamentos.
    // DICA: No caso de assinatura, o ideal é pegar a 'invoiceUrl' da primeira cobrança gerada.
    
    // Como a assinatura gera uma cobrança instantânea, vamos redirecionar para ela?
    // O Asaas não retorna a URL de pagamento direto no objeto Subscription.
    // Precisamos listar as cobranças dessa assinatura para pegar o link.
    
    // 4.1. Buscar a cobrança gerada pela assinatura para pegar o link de pagamento
    const paymentListResponse = await fetch(`${API_URL}/payments?subscription=${subscriptionData.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'access_token': API_KEY!
        }
    });
    
    const paymentList = await paymentListResponse.json();
    const firstPayment = paymentList.data[0]; // Pega a primeira cobrança da lista

    return NextResponse.json({ url: firstPayment.invoiceUrl });

  } catch (err: any) {
    console.error("Erro interno:", err);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}