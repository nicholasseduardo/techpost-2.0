// utils/githubLoader.ts

export async function getRepoContent(repoUrl: string): Promise<string> {
  try {
    console.log(`\n🚀 [SMART LOADER] Iniciando análise de: ${repoUrl}`);

    // 1. Limpeza da URL
    const cleanUrl = repoUrl
      .replace('https://', '')
      .replace('http://', '')
      .replace('github.com/', '')
      .replace('www.', '')
      .replace('.git', '')
      .split('#')[0]
      .replace(/\/$/, '');

    const parts = cleanUrl.split('/');
    const owner = parts[0];
    const repo = parts[1];

    if (!owner || !repo) return "";

    // 2. Headers com Token (Essencial)
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 3. Descobre a branch padrão
    let defaultBranch = 'main';
    try {
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (repoInfoRes.ok) {
        const data = await repoInfoRes.json();
        defaultBranch = data.default_branch;
      }
    } catch (e) { console.warn("Usando branch 'main' como fallback"); }

    // 4. Busca a árvore COMPLETA de arquivos
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeUrl, { headers });
    
    if (!treeResponse.ok) return `Erro ao ler GitHub: ${treeResponse.status}`;

    const treeData = await treeResponse.json();

    // 5. 🧠 A MÁGICA DA PONTUAÇÃO (SMART FILTER)
    // Vamos dar notas para os arquivos para decidir quem entra no prompt.
    const scoredFiles = treeData.tree
      .filter((file: any) => 
        file.type === 'blob' && 
        /\.(md|ts|tsx|js|jsx|py|java|c|cpp|h|css|json|sql)$/i.test(file.path) &&
        !file.path.includes('package-lock') &&
        !file.path.includes('yarn.lock') &&
        !file.path.includes('dist/') &&
        !file.path.includes('.next/') &&
        !file.path.includes('node_modules/')
      )
      .map((file: any) => {
        let score = 0;
        const path = file.path.toLowerCase();

        // 🥇 Prioridade Máxima: Documentação
        if (path.endsWith('readme.md')) score = 100;

        // 🥈 Prioridade Alta: Código Fonte (src, app, components, lib)
        else if (path.startsWith('src/') || path.startsWith('app/') || path.startsWith('lib/')) {
          if (path.endsWith('.tsx') || path.endsWith('.jsx')) score = 80; // Componentes visuais
          else if (path.endsWith('.ts') || path.endsWith('.js')) score = 70; // Lógica
          else score = 60;
        }

        // 🥉 Prioridade Baixa: Configurações na raiz
        else if (path.includes('config') || path.includes('json')) score = 10;
        else score = 20;

        return { ...file, score };
      });

    // 6. Ordena pelos mais importantes e pega o Top 12
    const topFiles = scoredFiles
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 12);

    console.log(`📂 [SMART LOADER] Selecionados ${topFiles.length} arquivos relevantes:`);
    topFiles.forEach((f: any) => console.log(`   - [${f.score}] ${f.path}`));

    // 7. Baixa e Compila o "Documentão"
    let combinedContext = `--- RELATÓRIO TÉCNICO DO REPOSITÓRIO (${owner}/${repo}) ---\n`;
    
    await Promise.all(topFiles.map(async (file: any) => {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
      const contentRes = await fetch(rawUrl, { headers: process.env.GITHUB_TOKEN ? headers : {} });
      
      if (contentRes.ok) {
        const text = await contentRes.text();
        // Limita tamanho por arquivo para caber mais arquivos diferentes
        combinedContext += `\n--- ARQUIVO: ${file.path} ---\n${text.slice(0, 3000)}\n`; 
      }
    }));

    return combinedContext;

  } catch (error) {
    console.error("❌ Erro fatal no loader:", error);
    return "";
  }
}