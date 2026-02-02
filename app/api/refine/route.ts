import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export const runtime = 'edge';

// Função para limpar sujeira de Markdown (igual usamos no generate)
function cleanText(text: string) {
  return text
    .replace(/```markdown/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { content, instruction } = await req.json();

    if (!content || !instruction) {
      return NextResponse.json({ error: "Conteúdo e instrução são obrigatórios" }, { status: 400 });
    }

    // PROMPT UNIFICADO (Funciona melhor com Gemma e garante obediência)
    const prompt = `
      Atue como um editor de Conteúdo Técnico profissional e altere o texto abaixo seguindo EXATAMENTE a instrução de edição e mudando o MÍNIMO POSSÍVEL o texto original.
      
      TEXTO ORIGINAL:
      "${content}"
      
      INSTRUÇÃO DE EDIÇÃO:
      ${instruction}
      
      REGRAS CRÍTICAS:
      1. Mantenha a formatação original (parágrafos, tópicos) onde possível.
      2. Retorne APENAS O TEXTO REESCRITO. Sem "Aqui está", sem aspas extras, sem conversas.
    `;

    let refinedText = "";

    // --- TENTATIVA 1: GEMMA 3 (Cota Alta: 14.4k/dia) ---
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        refinedText = cleanText(response.text());

    } catch (gemmaError) {
        console.error("⚠️ [DEBUG] Gemma 3 falhou no refinamento. Tentando Fallback...");
        
        // --- TENTATIVA 2: FALLBACK PARA GEMINI 2.5 FLASH (Cota Baixa mas Estável) ---
        try {
            console.log("🔄 [DEBUG] Usando Fallback: Gemini 2.5 Flash...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const result = await fallbackModel.generateContent(prompt);
            const response = await result.response;
            refinedText = cleanText(response.text());
            
        } catch (fallbackError) {
             console.error("❌ [FATAL] Todos os modelos de refinamento falharam.");
             throw fallbackError;
        }
    }

    return NextResponse.json({ refinedText });

  } catch (error) {
    console.error("Erro no refinamento:", error);
    return NextResponse.json({ error: "Erro ao refinar texto" }, { status: 500 });
  }
}