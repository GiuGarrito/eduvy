
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function StudentLessonsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch lessons for the student
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    const upcomingLessons = lessons?.filter(l => l.status === 'scheduled') || []
    const pastLessons = lessons?.filter(l => l.status === 'completed') || []

    const LessonCard = ({ lesson, isPast = false }: { lesson: any, isPast?: boolean }) => (
        <Card className={`hover:shadow-md transition-shadow ${!isPast ? 'border-l-4 border-l-blue-500' : 'bg-muted/40'}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="font-semibold text-lg">{lesson.title}</div>
                    <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(lesson.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {lesson.time}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isPast ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Realizada
                        </Badge>
                    ) : (
                        <Button size="sm" className="gap-2" asChild>
                            <Link href={`/portal/aula/${lesson.id}`}>
                                <PlayCircle className="h-4 w-4" />
                                Entrar
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Minhas Aulas 📅</h1>
                <p className="text-muted-foreground">Confira sua agenda e acesse o material das aulas.</p>
            </div>

            {/* Upcoming */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Próximas</h2>
                    <Badge variant="outline" className="text-xs">{upcomingLessons.length} agendadas</Badge>
                </div>
                <div className="space-y-3">
                    {upcomingLessons.length > 0 ? (
                        upcomingLessons.map(lesson => (
                            <LessonCard key={lesson.id} lesson={lesson} />
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma aula agendada.</p>
                    )}
                </div>
            </section>

            <Separator />

            {/* History */}
            <section>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Jornada de aprendizado</h2>
                <div className="space-y-3">
                    {pastLessons.map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} isPast />
                    ))}
                    {pastLessons.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">Nenhum histórico disponível.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
