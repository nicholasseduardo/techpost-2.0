import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // --- DEBUG: ISSO VAI SALVAR SUA VIDA NOS LOGS DA VERCEL ---
    console.log("🔥 WEBHOOK PAYLOAD RECEBIDO:", JSON.stringify(body, null, 2));
    // ---------------------------------------------------------

    const newUser = body.record;
    
    // Tenta achar o email em vários lugares possíveis
    const userEmail = newUser.email || newUser.user_email || body.old_record?.email; 

    if (!userEmail) {
        // Agora o erro vai aparecer no log com o motivo claro
        console.error("❌ Erro: Email não encontrado no objeto record:", newUser);
        return NextResponse.json({ message: "Email não encontrado no registro" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Nicholas do TechPost" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "Bem-vindo ao TechPost! 🚀",
      text: `Olá, ${newUser.full_name || 'Engenheiro'}! \n\nBem-vindo ao TechPost (Beta). \n\nAbs, Nicholas`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "E-mail de boas-vindas enviado!" });

  } catch (error) {
    console.error("Erro fatal ao enviar e-mail:", error);
    return NextResponse.json({ error: "Falha no envio" }, { status: 500 });
  }
}