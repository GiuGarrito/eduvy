"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2, Clock, PlayCircle, Settings2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EditLessonModal } from "@/components/lessons/edit-lesson-modal"

interface Lesson {
    id: string
    title: string
    date: string
    time: string
    status: string
}

export default function StudentLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState<any>(null)
    
    const supabase = createClient()
    const router = useRouter()

    const fetchLessons = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data } = await supabase
            .from('lessons')
            .select('*')
            .eq('student_id', user.id)
            .order('date', { ascending: true })
            .order('time', { ascending: true })

        if (data) {
            setLessons(data as Lesson[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLessons()
    }, [])

    const upcomingLessons = lessons.filter(l => l.status === 'scheduled')
    const pastLessons = lessons.filter(l => l.status === 'completed')
    const cancelledLessons = lessons.filter(l => l.status === 'cancelled')

    const handleEditClick = (lesson: Lesson) => {
        setSelectedLesson(lesson)
        setIsEditModalOpen(true)
    }

    const LessonCard = ({ lesson, isPast = false, isCancelled = false }: { lesson: Lesson, isPast?: boolean, isCancelled?: boolean }) => (
        <Card className={`hover:shadow-md transition-shadow ${!isPast && !isCancelled ? 'border-l-4 border-l-blue-500' : 'bg-muted/40'} ${isCancelled ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                    <div className={`font-semibold text-lg ${isCancelled ? 'line-through' : ''}`}>{lesson.title}</div>
                    <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(lesson.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {lesson.time.slice(0, 5)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isCancelled ? (
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelada
                        </Badge>
                    ) : isPast ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Realizada
                        </Badge>
                    ) : (
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEditClick(lesson)}>
                                <Settings2 className="h-4 w-4" />
                                Alterar/Cancelar
                            </Button>
                            <Button size="sm" className="gap-2" asChild>
                                <Link href={`/portal/aula/${lesson.id}`}>
                                    <PlayCircle className="h-4 w-4" />
                                    Entrar
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Carregando suas aulas...</div>
    }

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

            {cancelledLessons.length > 0 && (
                <>
                    <Separator />
                    <section>
                        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Aulas Canceladas</h2>
                        <div className="space-y-3">
                            {cancelledLessons.map(lesson => (
                                <LessonCard key={lesson.id} lesson={lesson} isCancelled />
                            ))}
                        </div>
                    </section>
                </>
            )}

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

            <EditLessonModal 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen} 
                lesson={selectedLesson} 
                onSuccess={fetchLessons}
            />
        </div>
    )
}
