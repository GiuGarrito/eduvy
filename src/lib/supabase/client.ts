
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Se as chaves estiverem faltando (comum no build do Netlify), retornamos um mock 
    // para que a compilação das páginas não quebre.
    if (!url || !key) {
        return {
            from: () => ({
                select: () => ({ order: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
                insert: () => Promise.resolve({ data: null, error: null }),
                delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
                update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
            }),
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            }
        } as any
    }
    
    return createBrowserClient(url, key)
}
