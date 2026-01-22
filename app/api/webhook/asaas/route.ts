import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payment } = body;

    // Log para você ver no terminal o que está chegando
    console.log(`🔔 Webhook Asaas Recebido: ${event}`, payment.id);

    // Filtra apenas pagamentos confirmados
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      
      // Inicializa Supabase com poder de ADMIN (Service Role)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // O 'externalReference' que mandamos no checkout é o ID do Usuário
      const userId = payment.externalReference;

      if (userId) {
        // Atualiza o usuário para VIP
        const { error } = await supabaseAdmin
          .from('profiles') // Certifique-se que sua tabela chama 'profiles'
          .update({ 
            is_vip: true, 
            plan: 'pro',
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId);

        if (error) {
          console.error('❌ Erro ao atualizar Supabase:', error);
          return NextResponse.json({ error: 'Erro no banco' }, { status: 500 });
        }

        console.log(`👑 USUÁRIO ${userId} AGORA É VIP!`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}