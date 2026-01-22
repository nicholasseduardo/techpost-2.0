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

    // Se por acaso o CPF vier vazio (burlando o front), retornamos erro antes de chamar o Asaas
    if (!cpf) {
        return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 });
    }

    const API_URL = process.env.ASAAS_API_URL;
    const API_KEY = process.env.ASAAS_API_KEY;

    // 3. Criar Cliente
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
      return NextResponse.json({ error: customerData.errors[0].description }, { status: 400 });
    }

    // 4. Criar Cobrança
    const paymentResponse = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY!
      },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'UNDEFINED',
        value: 14.90, // Confirme se é esse preço mesmo (R$ 14,90)
        dueDate: new Date().toISOString().split('T')[0],
        description: "Assinatura TechPost VIP",
        
        // --- CORREÇÃO AQUI ---
        externalReference: user.id, // Antes estava user.email, agora manda o ID correto para o Webhook ler
        // ---------------------
        
        postalService: false
      })
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.errors) {
      console.error("Erro ao criar cobrança Asaas:", paymentData.errors);
      return NextResponse.json({ error: paymentData.errors[0].description }, { status: 400 });
    }

    return NextResponse.json({ url: paymentData.invoiceUrl });

  } catch (err: any) {
    console.error("Erro interno:", err);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}