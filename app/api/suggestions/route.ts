import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export const runtime = 'edge';

function cleanJson(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Usuário do GitHub obrigatório" }, { status: 400 });
    }

    const ghResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=3`, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'TechPost-App' }
    });

    if (!ghResponse.ok) return NextResponse.json({ error: "Usuário GitHub não encontrado" }, { status: 404 });

    const repos = await ghResponse.json();
    
    const reposData = repos.map((r: any) => ({
        name: r.name,
        description: r.description || "Sem descrição",
        language: r.language,
        topics: r.topics
    }));

    // PROMPT ATUALIZADO: Pede 3 ideias por repo
    const prompt = `
      ATUE COMO: Especialista em Developer Relations (DevRel)
      TAREFA: Sugira 3 ideias de posts para LinkedIn e outras redes sociais para cada repositório abaixo.
      REPOSITÓRIOS:
      ${JSON.stringify(reposData, null, 2)}

      IMPORTANTE: Responda APENAS com o JSON válido abaixo. Sem introduções. Sem markdown.

      MODELO DE RESPOSTA (JSON):
      [
        {
          "repo_name": "Nome do Repo",
          "ideas": [
            { "title": "Título Curto", "context_prompt": "Ideia detalhada..." },
            { "title": "Título Curto", "context_prompt": "Ideia detalhada..." },
            { "title": "Título Curto", "context_prompt": "Ideia detalhada..." }
          ]
        }
      ]
    `;

    // Bloco Novo com Gemma e Fallback
    try {
        // Usando a família Gemma (Limite alto no print: 14.4k/dia)
        // Nota: A API geralmente usa 'gemma-3-27b-it' como string estável.
        const model = genAI.getGenerativeModel({ 
            model: "gemma-3-27b-it", 
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Limpa o texto (remove ```json) antes de ler
        const suggestions = JSON.parse(cleanJson(text));

        return NextResponse.json({ suggestions });

    } catch (aiError) {
        console.error("Erro na IA (Tentando Fallback):", aiError);
        
        // Fallback para não quebrar o site se a API falhar
        return NextResponse.json({ 
            suggestions: [
                {
                    repo_name: "Modo Offline (API Limitada)",
                    ideas: [
                        { title: "Limite da IA Atingido", context_prompt: "A API do Google chegou ao limite. Tente mais tarde." },
                        { title: "Escrever Manualmente", context_prompt: "Use o botão 'Gerar Post' para criar seu conteúdo." },
                        { title: "Revisar Conteúdo", context_prompt: "Que tal revisar seus posts antigos?" }
                    ]
                }
            ]
        });
    }

  } catch (error) {
    console.error("Erro nas sugestões:", error);
    return NextResponse.json({ error: "Erro ao gerar sugestões" }, { status: 500 });
  }
}