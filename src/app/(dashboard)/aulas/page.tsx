
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, List, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddLessonModal } from "@/components/lessons/add-lesson-modal"
import { EditLessonModal } from "@/components/lessons/edit-lesson-modal"
import { createClient } from "@/lib/supabase/client"

interface Lesson {
    id: string
    title: string
    date: string
    time: string
    status: string
    student_id: string
    notes?: string
    content?: string
    meet_link?: string
    videos?: { title: string, url: string }[]
    materials?: { title: string, url: string }[]
    student: {
        full_name: string
        email: string
    }
}

export default function LessonsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('lessons')
                .select(`
                    *,
                    student:profiles(full_name, email)
                `)
                .order('date', { ascending: true })
                .order('time', { ascending: true })

            if (data) {
                // @ts-ignore - Supabase type conversion
                setLessons(data)
            }
            setLoading(false)
        }

        // Initial fetch
        fetchLessons()

        // Subscribe to changes
        const channel = supabase
            .channel('lessons_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'lessons' },
                () => {
                    fetchLessons()
                })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    // Filter lessons based on search
    const filteredLessons = lessons.filter(lesson =>
        (lesson.student?.full_name || lesson.student?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Aulas</h2>
                    <p className="text-muted-foreground">
                        Histórico completo e agendamentos futuros.
                    </p>
                </div>
                <Button onClick={() => setIsAddLessonOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Aula
                </Button>
            </div>

            <AddLessonModal
                open={isAddLessonOpen}
                onOpenChange={setIsAddLessonOpen}
            />

            <Tabs defaultValue="list" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="list">
                            <List className="mr-2 h-4 w-4" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Calendário
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full max-w-sm ml-auto hidden sm:block">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar aula ou aluno..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List View */}
                <TabsContent value="list" className="space-y-4">
                    <div className="relative w-full mb-4 sm:hidden">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Todas as Aulas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-4">Carregando aulas...</div>
                                ) : (
                                    <>
                                        {filteredLessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex flex-col items-center justify-center h-12 w-12 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                                        <span className="text-xs font-bold uppercase">
                                                            {/* Dealing with timezone issues by simply appending T00:00:00 if date string doesn't have it, or parsing date parts */}
                                                            {new Date(lesson.date + 'T12:00:00').toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                        <span className="text-lg font-bold leading-none">
                                                            {new Date(lesson.date + 'T12:00:00').getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{lesson.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Aluno: <span className="font-medium text-foreground">{lesson.student?.full_name || lesson.student?.email}</span>
                                                        </p>
                                                        <div className="flex items-center text-xs text-muted-foreground mt-1 sm:hidden">
                                                            {lesson.time}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant={lesson.status === 'completed' ? 'secondary' : 'outline'}>
                                                        {lesson.status === 'completed' ? 'Concluída' : 'Agendada'}
                                                    </Badge>
                                                    <span className="text-sm font-medium hidden sm:block">{lesson.time}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
                                                        Editar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {!loading && filteredLessons.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhuma aula encontrada.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <EditLessonModal
                    open={!!editingLesson}
                    onOpenChange={(open) => !open && setEditingLesson(null)}
                    lesson={editingLesson}
                    onSuccess={() => window.location.reload()} // Quick refresh for now
                />

                {/* Calendar View */}
                <TabsContent value="calendar">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardContent className="pt-6 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow-sm p-4"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Aulas em {date?.toLocaleDateString('pt-BR')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {lessons
                                        .filter(l => l.date === date?.toISOString().split('T')[0])
                                        .map(lesson => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md">
                                                <div>
                                                    <div className="font-medium">{lesson.student?.full_name || lesson.student?.email}</div>
                                                    <div className="text-sm text-muted-foreground">{lesson.title}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{lesson.time}</div>
                                                    <Badge variant="outline" className="text-[10px] h-5">{lesson.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    {lessons.filter(l => l.date === date?.toISOString().split('T')[0]).length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            Sem aulas neste dia.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
