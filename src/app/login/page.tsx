'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { AnimatedText } from '@/components/ui/animated-text'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            // Check user role to redirect appropriately
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch profile to check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'student') {
                    router.push('/portal')
                } else {
                    router.push('/')
                }
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary p-4">
            <div className="mb-8 text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                    Bem vindo a EDUVY
                </h1>
                <p className="text-primary-foreground/80 text-lg">
                    Sua plataforma de gestão educacional
                </p>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden animate-in zoom-in-95 duration-500 delay-150">
                <CardHeader className="space-y-1 pb-2">
                    <CardTitle className="text-2xl font-bold text-center text-primary">Login</CardTitle>
                    <CardDescription className="text-center">
                        Insira seus dados para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemplo@eduvy.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Sua senha secreta"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md transition-all hover:scale-[1.02]" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Acessar Plataforma
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <p className="text-xs text-muted-foreground text-center px-4">
                        Esqueceu a senha? Solicite ao administrador da sua instituição.
                    </p>
                </CardFooter>
            </Card>

            <div className="mt-8 text-white/40 text-sm">
                &copy; 2024 Eduvy Inc.
            </div>
        </div>
    )
}
