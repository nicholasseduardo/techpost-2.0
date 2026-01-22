import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // <--- TEM QUE SER ESSE IMPORT

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payment } = body;

    console.log(`🔔 WEBHOOK RECEBIDO: ${event}`);

    // Filtra apenas pagamentos confirmados
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      
      const userId = payment.externalReference;
      console.log(`👤 ID do Usuário recebido do Asaas: ${userId}`);

      // 1. Verifica se a chave secreta existe
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis!');
        return NextResponse.json({ error: 'Configuração de servidor ausente' }, { status: 500 });
      }

      // 2. Cria o cliente ADMIN (que pode tudo)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 3. Tenta atualizar e pede o retorno (.select())
      const { data, error } = await supabaseAdmin
        .from('profiles') // <--- CONFIRA SE O NOME DA TABELA É ESSE
        .update({ 
          is_vip: true,
        })
        .eq('id', userId)
        .select();

      // 4. Diagnóstico do Resultado
      if (error) {
        console.error('❌ ERRO DO SUPABASE:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        console.error(`⚠️ ALERTA: Sucesso técnico, mas NENHUMA linha foi alterada. Motivos prováveis:
          1. O usuário com ID ${userId} NÃO existe na tabela 'profiles'.
          2. A tabela tem outro nome.
          3. Row Level Security bloqueou (pouco provável com service_role).`);
      } else {
        console.log('✅ SUCESSO ABSOLUTO! Usuário atualizado:', data);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ ERRO NO CÓDIGO:', error.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}