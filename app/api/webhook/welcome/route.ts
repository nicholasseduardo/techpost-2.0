import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Recebe o aviso do Supabase
export async function POST(req: Request) {
  try {
    // 1. Pega os dados que o Supabase mandou
    const body = await req.json();
    
    // O Supabase manda os dados da nova linha dentro de 'record'
    // Dependendo de como sua tabela profiles é, o email pode estar em 'email' ou você precisa buscar na tabela users
    // Vamos assumir que na tabela 'profiles' você salvou o email ou o ID.
    // SE sua tabela profiles não tem email, nós pegamos do body.record (verifique seus logs depois)
    
    const newUser = body.record;
    
    // Se não tiver email no record (depende da sua estrutura), paramos por aqui para não quebrar
    // Mas vamos tentar enviar assumindo que você tem o email ou que vamos mandar pro seu email de admin para testar
    const userEmail = newUser.email || newUser.user_email; // Ajuste conforme sua coluna no banco

    if (!userEmail) {
        return NextResponse.json({ message: "Email não encontrado no registro" }, { status: 400 });
    }

    // 2. Configura o "Carteiro" (Transporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 3. O E-mail Pessoal (Texto simples converte mais!)
    const mailOptions = {
      from: `"Nicholas do TechPost" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "Bem-vindo ao TechPost! 🚀",
      text: `Olá, ${newUser.full_name || 'Engenheiro'}!

Meu nome é Nicholas, sou o criador do TechPost IA. Vi que você acabou de criar sua conta e queria dar as boas-vindas pessoalmente.

Criei essa ferramenta porque sei como muitas vezes pode ser difícil transformar projetos de trabalho em textos para construir autoridade, principalmente em redes sociais como o LinkedIn.

O TechPost está em fase de desenvolvimento e eu adoraria saber o que você achou do seu primeiro post gerado.

Aliás, preparei uma condição especial para você adiquirir nosso plano PRO vitalício com pagamento único com 70% de desconto, por só R$14,90! Mas cuidado, a oferta é por tempo limitado!

Se tiver qualquer dúvida ou sugestão, é só responder a este e-mail. Eu leio e respondo todos!

Um abraço,
Nicholas
TechPost IA`,
    };

    // 4. Envia
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "E-mail de boas-vindas enviado!" });

  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json({ error: "Falha no envio" }, { status: 500 });
  }
}