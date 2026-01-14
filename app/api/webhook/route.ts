import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; 

// 1. Configura o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

// 2. Configura o Supabase com PODERES DE ADMIN (Service Role)
// Usamos isso porque o webhook roda no servidor, sem usuário logado.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text(); // Pega o texto bruto da requisição
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    // 3. Verifica se o aviso veio realmente da Stripe (Segurança)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Erro de assinatura: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 4. Se o pagamento foi aprovado...
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Pegamos o ID do usuário que enviamos no momento da compra (client_reference_id)
    const userId = session.client_reference_id; 

    if (userId) {
      console.log(`💰 Pagamento recebido! Liberando VIP para: ${userId}`);
      
      // 5. Atualiza o banco de dados para VIP = true
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ is_vip: true })
        .eq("id", userId);

      if (error) {
        console.error("Erro ao atualizar Supabase:", error);
        return NextResponse.json({ error: "Erro ao atualizar banco" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}