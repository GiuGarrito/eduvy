
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Roda apenas em páginas reais, ignorando:
         * - _next/static, _next/image, favicon, arquivos estáticos
         * - Chamadas de API internas do Next.js
         */
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
    ],
}
