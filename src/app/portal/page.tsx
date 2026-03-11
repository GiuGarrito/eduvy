
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentPortalHome() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Lógica Financeira (Vencimento)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
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

    // Get latest announcement
    const { data: latestAnnouncement } = await supabase
        .from('announcements')
        .select('*')
        .or(`student_id.is.null,student_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Lógica Financeira e Cálculos
    const dueDay = profile?.due_day
    let diasAteVencimento = 0
    let estaAtrasado = false
    let isVencimentoAtivo = false

    if (dueDay) {
        isVencimentoAtivo = true
        const hoje = new Date()
        const diaAtual = hoje.getDate()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()

        const dataVencimento = new Date(anoAtual, mesAtual, dueDay)
        
        // Remove time portion for accurate day calculation
        const date1 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
        const date2 = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate())
        
        const tempoDiff = date2.getTime() - date1.getTime()
        diasAteVencimento = Math.ceil(tempoDiff / (1000 * 3600 * 24))

        // Se o dia já passou e o aluno não pagou (lógica de pagamento simplificada: assumindo atraso se passou do dia no mês atual)
        if (diasAteVencimento < 0) {
            estaAtrasado = true
        }
    }

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

            {/* Financial Overview Card */}
            {isVencimentoAtivo && (
                <Card className={estaAtrasado ? "border-red-500 bg-red-50/50" : "border-green-500 bg-green-50/50"}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            {estaAtrasado ? (
                                <><AlertTriangle className="h-5 w-5 text-red-500" /> Situação Financeira</>
                            ) : (
                                <><CheckCircle2 className="h-5 w-5 text-green-500" /> Situação Financeira</>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {estaAtrasado ? (
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold text-red-600">Mensalidade em atraso</span>
                                <span className="text-sm text-red-500/80">O vencimento era dia {dueDay}. Regularize sua situação para continuar acessando as aulas.</span>
                                <Button asChild variant="destructive" size="sm" className="w-fit mt-2">
                                    <Link href="/portal/financeiro">Pagar Agora</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-bold text-green-700">Mensalidade em dia</span>
                                <span className="text-sm text-green-600/80">
                                    {diasAteVencimento === 0 ? "O vencimento é hoje!" : `Próximo vencimento em ${diasAteVencimento} dia(s) (Dia ${dueDay}).`}
                                </span>
                                <Button asChild variant="outline" size="sm" className="w-fit mt-2 border-green-200 text-green-700 hover:bg-green-100">
                                    <Link href="/portal/financeiro">Ver Detalhes</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/portal/agendar">
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar Nova Aula
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Announcement Section */}
            {latestAnnouncement && (
                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                                <Megaphone className="h-4 w-4" />
                                {latestAnnouncement.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-[0.6rem] bg-blue-100 text-blue-800 border-blue-200">
                                Novo
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700">
                        <p className="line-clamp-3">{latestAnnouncement.content}</p>
                        <Button variant="link" asChild className="p-0 h-auto text-xs text-blue-800 font-bold mt-2">
                            <Link href="/portal/avisos">Ler aviso completo</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
