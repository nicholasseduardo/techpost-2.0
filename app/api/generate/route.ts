import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Você precisa estar logado para gerar posts." }, 
        { status: 401 }
      );
    }

    // Busca os dados do perfil (para ver se é VIP e quantos posts fez)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Limite de Posts
    const FREE_LIMIT = 2; 

    // Verifica se deve bloquear
    // Se (Perfil existe) E (NÃO é VIP) E (Contagem >= Limite)
    if (profile && !profile.is_vip && (profile.usage_count || 0) >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "Limite gratuito atingido." }, 
        { status: 403 } // <--- O Frontend espera esse 403 para mostrar o Paywall
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não configurada no servidor" }, 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const data = await req.json();
    
    // Montando o prompt com os dados que vieram do frontend
    const prompt = `
      Você é um especialista em Copyrighting e Ghostwriter para CTOs e Engenheiros Sêniores, além de especialista em SEO.
      Sua tarefa é escrever um post para a rede social ${data.channel} com alta densidade, mas leitura fluida.

      PRIMEIRA LINHA OBRIGATÓRIA: 
      Crie um Título curto (máximo 5 palavras) e chamativo para esse post. Não use aspas.
      
      
      Depois do título, pule duas linhas e comece o post.
      
      DADOS DE ENTRADA:
      - Tema/Contexto: "${data.context}"
      - Público-Alvo: ${data.audience} -> Muita atenção para usar a linguagem adequada para se conectar com esse público!!
      - Objetivo: ${data.objective}
      - Tom de Voz: ${data.tone}

      ESTRUTURA OBRIGATÓRIA DO POST:
      1. Hook (Gancho): Uma frase curta e polêmica ou um dado técnico surpreendente para prender a atenção (máximo 2 linhas).
      2. Desenvolvimento: Explique o problema e a solução técnica, de forma que o público (${data.audience}) consiga entender.
      3. Conclusão/CTA: Finalize com uma pergunta que gere debate ou perguntas nos comentários.

      REGRAS DE ESTILO:
      - Use apenas texto normal (não use negrito por exemplo).
      - Use emojis com moderação, estilo "minimalista", de preferência, só no fim.
      - Evite jargões corporativos vazios ("sinergia", "disruptivo"). Prefira termos técnicos reais, e só se forem agregar valor.
      - Parágrafos curtos (máximo 4 frases).
      - Se o texto for para o Instagram, use parágrafos ainda menores e não ultrapasse 3 parágrafos!
      - O texto deve parecer escrito por um humano experiente, não por um robô.
      - Tente expor um pouco de opinião e use ironia leve se necessário.
      - Se o contexto for pequeno, não crie textos longos, seja direto!

      Gere apenas o conteúdo do post, sem preâmbulos.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullText = response.text();

    const parts = fullText.split('\n');
    const title = parts[0].trim(); // A primeira linha é o título
    // O resto é o conteúdo (juntamos de volta pulando a primeira linha)

    const content = parts.slice(1).join('\n').trim();

    // Salva no Supabase (Note que agora salvamos 'title' e 'content' separado)
    const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        context_prompt: data.context,
        audience: data.audience,
        tone: data.tone,
        title: title,       // <--- CAMPO NOVO
        generated_text: content // <--- Salva só o corpo aqui
    });

    if (dbError) {
        console.error("Erro ao salvar no Supabase:", dbError);
    }

    // 1. Busca o contador atual
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('usage_count')
      .eq('id', user.id)
      .single();

    // 2. Se achou o perfil, soma +1
    if (currentProfile) {
      await supabase
        .from('profiles')
        .update({ usage_count: (currentProfile.usage_count || 0) + 1 })
        .eq('id', user.id);
    }

    return NextResponse.json({ 
      text: content, 
      title: title 
      });
    
  } catch (error) {
    console.error("Erro no backend:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar post" }, 
      { status: 500 }
    );
  }
}