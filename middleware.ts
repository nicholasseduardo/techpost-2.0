import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {

  const path = request.nextUrl.pathname  
// 🚨 ROTAS PÚBLICAS (Acesso Liberado sem Login)
  if (
    path.startsWith('/api/webhook') || 
    path === '/' ||                    
    path.startsWith('/auth') ||        
    path.startsWith('/privacy') ||     
    path.startsWith('/terms') ||
    path.startsWith('/login')
  ) {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
}