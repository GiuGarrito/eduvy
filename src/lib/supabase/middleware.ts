
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // Durante o build ou se as chaves não estiverem configuradas, o middleware
        // apenas passará a requisição adiante sem tentar autenticar no Supabase.
        return response
    }

    const supabase = createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isLoginPage = request.nextUrl.pathname === '/login'
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')
    const isPublicStaticFile = request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)

    // 1. Se NÃO estiver logado e NÃO for uma página pública, vai para /login
    if (!user && !isLoginPage && !isAuthCallback && !isPublicStaticFile) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Se ESTIVER logado e tentar acessar /login, vai para a home (dashboard admin ou portal)
    if (user && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}
