import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server"; // Caminho para seu Supabase
import Stripe from "stripe";

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Pode manter essa ou remover se der erro de versão
});

export async function POST(req: Request) {
  try {
    // 1. Verificar quem é o usuário (Pra saber quem está pagando!)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Pega a URL do site (localhost ou vercel) para saber pra onde voltar
    const origin = req.headers.get('origin');

    // 3. Cria a Sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // pix e cartão
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // O ID que colocamos no .env
          quantity: 1,
        },
      ],
      mode: 'payment', // Pagamento único (não é assinatura)
      success_url: `${origin}/?success=true`, // Pra onde vai se der certo
      cancel_url: `${origin}/?canceled=true`, // Pra onde vai se ele desistir
      client_reference_id: user.id, // IMPORTANTE: Grava o ID do usuário na compra
      metadata: {
        userId: user.id, // Reforço para garantir
      }
    });

    // 4. Devolve a URL de pagamento para o Frontend
    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Erro no Stripe:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}