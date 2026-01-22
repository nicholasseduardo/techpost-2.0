import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  
  // 🚨 NOVA REGRA: O "Crachá VIP" para o Webhook
  // Se a rota começar com /api/webhook, deixa passar direto sem checar login
  if (request.nextUrl.pathname.startsWith('/api/webhook')) {
    return NextResponse.next()
  }

  // Para todas as outras rotas, segue o fluxo normal de autenticação
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone)
     * - images, png, jpg, etc. (arquivos públicos)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}