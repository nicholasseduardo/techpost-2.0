import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { getRepoContent } from "../../../utils/githubLoader"; 

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

    // 👇 AQUI COMEÇA A MUDANÇA (Raio-X)
    const body = await req.json();
    const { channel, audience, objective, tone, length, context, filesData, repoUrl } = body;

    console.log("-------------------------------------------------");
    console.log("📡 [DEBUG] Recebido no Backend:");
    console.log("🔗 RepoURL:", repoUrl); // <--- O link chegou aqui?
    console.log("📝 Contexto Usuário:", context);


    // --------------------


    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- LÓGICA DE TAMANHO ---
    let lengthInstruction = "";
    switch (length) {
      case 'SHORT': 
        lengthInstruction = "Curto e direto. Máximo 2 parágrafos curtos + 1 frase de impacto. Ideal para leitura rápida."; 
        break;
      case 'LONG': 
        lengthInstruction = "Longo e aprofundado. Mínimo 5 parágrafos. Use estrutura de 'mini-artigo'. Explore os detalhes técnicos."; 
        break;
      default: // MEDIUM
        lengthInstruction = "Tamanho médio. Entre 3 a 4 parágrafos. Equilibrado entre profundidade e fluidez.";
    }

    // 👇 DEBUG NA HORA DE BAIXAR O GITHUB
    let githubContext = "";
    if (repoUrl && repoUrl.includes('github.com')) {
      console.log("⏳ [DEBUG] Iniciando download do GitHub...");
      try {
        githubContext = await getRepoContent(repoUrl);
        console.log("✅ [DEBUG] Download concluído!");
        console.log(`📦 [DEBUG] Tamanho do Contexto GitHub: ${githubContext.length} caracteres`);
        console.log("📜 [DEBUG] Preview do início:", githubContext.slice(0, 100)); // Mostra o comecinho
      } catch (err) {
        console.error("❌ [DEBUG] Erro ao baixar GitHub:", err);
      }
    } else {
      console.log("⚠️ [DEBUG] Nenhuma URL de GitHub válida detectada.");
    }

    // --- NOVO PROMPT ---
    const promptText = `
      Você é um especialista em Copyrighting e Ghostwriter trabalhando para CTOs e Engenheiros Sêniores.
      Sua tarefa é escrever um post para a rede social ${channel}.

      DADOS DE ENTRADA:
      - Público-Alvo: ${audience} (Cuidado ao usar linguagem técnica).
      - Objetivo: ${objective}
      - Tom de Voz: ${tone}
      - Tamanho Obrigatório: ${lengthInstruction}
      
      CONTEXTO DO USUÁRIO (Ideias/Rascunhos):
      "${context}"
      ${githubContext ? `\nCONTEXTO TÉCNICO EXTRAÍDO DO GITHUB (Use isso como base principal):\n${githubContext}\n` : ""}
      ${filesData && filesData.length > 0 ? "IMPORTANTE: Use os arquivos anexados como fonte principal de informação técnica." : ""}

      ESTRUTURA OBRIGATÓRIA:
      1. Título: Na PRIMEIRA LINHA, escreva um título curto e chamativo (sem aspas).
      2. Pule duas linhas.
      3. Corpo do Post:
         - Hook (Gancho) polêmico ou técnico.
         - Desenvolvimento claro da solução.
         - CTA (Chamada para ação).
         - Adicione Hashtags se for para o Instagram

      REGRAS DE ESTILO:
      - Sem negrito (**texto**). Apenas texto puro.
      - Evite jargões vazios ("sinergia").
      - Escreva como um humano sênior.
      - Quando necessário, emita pequenas opiniões e use um pouco de ironia.
    `;

    // --- PROCESSAMENTO DE ARQUIVOS (MULTIMODAL) ---
    const promptParts: any[] = [{ text: promptText }];

    if (filesData && Array.isArray(filesData) && filesData.length > 0) {
      filesData.forEach((file: any) => {
        // Pega apenas a string base64 pura (remove o "data:image/png;base64,")
        const base64Data = file.base64.split(',')[1];
        
        if (base64Data) {
          promptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: file.mimeType,
            },
          });
        }
      });
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const fullText = response.text();

    const parts = fullText.split('\n');
    const title = parts[0].trim();
    const content = parts.slice(1).join('\n').trim();

    // Salva no Supabase
    const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        context_prompt: context,
        audience: audience,      
        tone: tone,              
        title: title || "Sem Título",
        generated_text: content || fullText 
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