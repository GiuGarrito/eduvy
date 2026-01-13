
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Calendar, Clock, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentPortalHome() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile name specifically (assuming metadata contains it or we query profiles)
    // For now, let's try to get it from metadata or fallback to email
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const paramName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno'

    // Capitalize first letter just in case
    const displayName = paramName.charAt(0).toUpperCase() + paramName.slice(1)


    // Get next lesson
    const today = new Date().toISOString().split('T')[0]

    const { data: nextLesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(1)
        .single()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Olá, {displayName}! 👋</h1>
                <p className="text-muted-foreground">Bem-vindo ao seu portal.</p>
            </div>

            {/* Next Class Card (Highlight) */}
            <Card className="border-l-4 border-l-primary shadow-md">
                <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">Próxima Aula</Badge>
                    <CardTitle className="text-xl">
                        {nextLesson ? nextLesson.title : 'Nenhuma aula agendada'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {nextLesson ? (
                        <>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4 text-primary" />
                                <span>{new Date(nextLesson.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4 text-primary" />
                                <span>{nextLesson.time}</span>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <Button className="w-full" asChild>
                                    <Link href={`/portal/aula/${nextLesson.id}`}>
                                        Acessar Sala de Aula
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="py-4 text-sm text-muted-foreground">
                            Você não tem aulas agendadas para os próximos dias.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-primary">85%</span>
                        <span className="text-xs text-muted-foreground mt-1">Frequência Mensal</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-primary">8</span>
                        <span className="text-xs text-muted-foreground mt-1">Aulas Restantes</span>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Notices */}
            <Card className="bg-blue-50 border-blue-100">
                <CardHeader>
                    <CardTitle className="text-base text-blue-800">Aviso Importante</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700">
                    O Studio estará fechado no feriado do dia 15/01. Sua aula foi reagendada automaticamente.
                </CardContent>
            </Card>
        </div>
    )
}
