import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  description: "Gerador de posts com IA para engenheiros",
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="min-h-screen bg-[#020617]">
          {children}
        </main>

        {/* --- NOVO RODAPÉ AQUI --- */}
        <footer className="bg-[#0a101f] border-t border-slate-800 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs">
              © 2026 TechPostIA. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="/terms" className="text-slate-500 hover:text-blue-400 text-xs transition-colors">Termos de Uso</a>
              <a href="/privacy" className="text-slate-500 hover:text-blue-400 text-xs transition-colors">Privacidade</a>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
