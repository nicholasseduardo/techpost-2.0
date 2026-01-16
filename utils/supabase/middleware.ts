import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Cria uma resposta inicial (que vamos modificar com os cookies depois)
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Cria o cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Aqui a mágica acontece: atualizamos os cookies na resposta
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Verifica o usuário
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // DEFINA AQUI O QUE É PÚBLICO
  // Se a pessoa acessar qualquer coisa que NÃO seja login, cadastro ou recuperação de senha...
  const isPublicRoute = 
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup') ||
      request.nextUrl.pathname.startsWith('/auth'); // importante para confirmar email

  // Se NÃO é rota pública e NÃO tem usuário...
  if (!isPublicRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se TEM usuário e ele tenta entrar no login...
  if (user && isPublicRoute) {
     const url = request.nextUrl.clone()
     url.pathname = '/' // Manda para a home (sua área logada)
     return NextResponse.redirect(url)
  }

  return supabaseResponse
}