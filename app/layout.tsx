import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import FeedbackButton from "./components/FeedbackButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPost IA",
  description: "Transforme ideias em posts virais para LinkedIn e Instagram. A ferramenta de IA definitiva para desenvolvedores e profissionais de tecnologia.",
  keywords: ["IA", "LinkedIn", "Tech", "Post Técnico", "Desenvolvimento", "Marketing para Devs"],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "TechPost IA",
    description: "Crie posts técnicos que geram autoridade no LinkedIn em segundos.",
    url: "https://techpostia.vercel.app",
    siteName: "TechPost IA",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPost IA",
    description: "Crie posts técnicos que geram autoridade com IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="min-h-screen bg-[#020617]">
          {children}
        </main>

        <FeedbackButton /> 

        {/* --- NOVO RODAPÉ AQUI --- */}
        
        <Analytics />

      </body>
    </html>
  );
}
