"use client"

export const dynamic = "force-dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { startOfWeek, addDays, format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // Assuming sonner is installed/configured, or use alert if not available yet. Using alert for now to be safe based on existing code.
import { EditLessonModal } from "@/components/lessons/edit-lesson-modal"

const weekDays = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
]

interface Lesson {
    id: string
    title: string
    date: string // YYYY-MM-DD
    time: string // HH:mm
    status: string
    student: {
        full_name: string
    }
}

interface Profile {
    id: string
    full_name: string
    email: string
}

interface BlockedDate {
    id: string
    date: string
    start_time?: string
    end_time?: string
    reason?: string
}

export default function AgendaPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
    const [students, setStudents] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newLessonStudent, setNewLessonStudent] = useState("")
    const [newLessonDate, setNewLessonDate] = useState("")
    const [newLessonTime, setNewLessonTime] = useState("")
    const [newLessonTitle, setNewLessonTitle] = useState("Aula Avulsa")
    const [creatingLesson, setCreatingLesson] = useState(false)

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState<any>(null)

    // Calculate current week dates
    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
    const weekDates = weekDays.map((_, index) => addDays(startOfCurrentWeek, index))

    const fetchLessons = async () => {
        const startDate = format(startOfCurrentWeek, 'yyyy-MM-dd')
        const endDate = format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd') // Friday

        // Fetch Lessons
        const { data: lessonsData } = await supabase
            .from('lessons')
            .select(`
                id, title, date, time, status,
                student:profiles(full_name)
            `)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('time')

        // Fetch Blocked Dates
        const { data: blocksData } = await supabase
            .from('blocked_dates')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)

        if (lessonsData) {
            // @ts-ignore
            setLessons(lessonsData)
        }
        if (blocksData) {
            setBlockedDates(blocksData)
        }
        setLoading(false)
    }

    const fetchStudents = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'student')
            .order('full_name') // Order by name

        if (data) {
            setStudents(data)
        }
    }

    useEffect(() => {
        fetchLessons()
        fetchStudents()
    }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreateLesson = async () => {
        if (!newLessonStudent || !newLessonDate || !newLessonTime) {
            alert("Preencha todos os campos obrigatórios.")
            return
        }

        setCreatingLesson(true)
        const { error } = await supabase.from('lessons').insert({
            title: newLessonTitle,
            date: newLessonDate,
            time: newLessonTime,
            student_id: newLessonStudent,
            status: 'scheduled'
        })

        if (error) {
            console.error(error)
            alert("Erro ao criar aula.")
        } else {
            alert("Aula criada com sucesso!")
            setIsDialogOpen(false)
            setNewLessonStudent("")
            setNewLessonDate("")
            setNewLessonTime("")
            fetchLessons()
        }
        setCreatingLesson(false)
    }

    const handleLessonActions = (lesson: any) => {
        setSelectedLesson(lesson)
        setIsEditModalOpen(true)
    }


    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Agenda Semanal</h2>
                    <p className="text-muted-foreground">
                        Semana de {format(startOfCurrentWeek, "dd/MM", { locale: ptBR })} a {format(addDays(startOfCurrentWeek, 4), "dd/MM", { locale: ptBR })}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Aula
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Agendar Aula Manualmente</DialogTitle>
                                <DialogDescription>
                                    Crie uma aula avulsa para um aluno específico.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="student">Aluno</Label>
                                    <Select value={newLessonStudent} onValueChange={setNewLessonStudent}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um aluno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.full_name || student.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Data</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={newLessonDate}
                                            onChange={(e) => setNewLessonDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time">Horário</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={newLessonTime}
                                            onChange={(e) => setNewLessonTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Título da Aula</Label>
                                    <Input
                                        id="title"
                                        value={newLessonTitle}
                                        onChange={(e) => setNewLessonTitle(e.target.value)}
                                        placeholder="Ex: Aula de Revisão"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreateLesson} disabled={creatingLesson}>
                                    {creatingLesson && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Agendar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button asChild variant="outline">
                        <Link href="/agenda/disponibilidade">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar Disp.
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 h-[calc(100vh-200px)]">
                {weekDates.map((dayDate: Date, index: number) => {
                    const dateStr = format(dayDate, 'yyyy-MM-dd')
                    const dayLessons = lessons.filter((l: Lesson) => 
                        l.date === dateStr && 
                        l.status !== 'cancelled'
                    )
                    const dayBlocks = blockedDates.filter((b) => b.date === dateStr)
                    const currentDayName = weekDays[index]

                    return (
                        <Card key={currentDayName} className="flex flex-col h-full bg-slate-50/50">
                            <CardHeader className="py-3 px-4 bg-white border-b">
                                <CardTitle className="text-sm font-medium text-center">
                                    {currentDayName} <span className="text-xs text-muted-foreground ml-1">({format(dayDate, 'dd/MM')})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-2">
                                <ScrollArea className="h-full">
                                    <div className="space-y-2">
                                        {dayLessons.map((lesson: Lesson) => (
                                            <div
                                                key={lesson.id}
                                                className={`p-3 bg-white rounded-md border shadow-sm text-sm hover:border-blue-400 transition-colors cursor-pointer ${lesson.status === 'cancelled' ? 'opacity-50 line-through' : ''}`}
                                                onClick={() => handleLessonActions(lesson)}
                                            >
                                                <div className="font-bold text-blue-600">{lesson.time.slice(0, 5)}</div>
                                                <div className="font-medium truncate" title={lesson.student?.full_name}>
                                                    {lesson.student?.full_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">{lesson.title}</div>
                                                {lesson.status === 'cancelled' && (
                                                    <div className="text-[10px] text-red-500 font-bold mt-1">CANCELADA</div>
                                                )}
                                            </div>
                                        ))}

                                        {dayBlocks.map((block) => (
                                            <div
                                                key={block.id}
                                                className="p-3 bg-red-50 border-red-100 rounded-md border shadow-sm text-sm"
                                            >
                                                <div className="font-bold text-red-600">
                                                    {block.start_time && block.end_time 
                                                        ? `${block.start_time.slice(0, 5)} - ${block.end_time.slice(0, 5)}`
                                                        : 'DIA INTEIRO'}
                                                </div>
                                                <div className="font-medium text-red-800">HORÁRIO BLOQUEADO</div>
                                                <div className="text-[10px] text-red-500 mt-1 uppercase">Indisponível para alunos</div>
                                            </div>
                                        ))}

                                        {dayLessons.length === 0 && dayBlocks.length === 0 && (
                                            <div className="text-center text-xs text-muted-foreground py-4">
                                                Livre
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <EditLessonModal 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen} 
                lesson={selectedLesson} 
                onSuccess={fetchLessons}
            />
        </div>
    )
}
