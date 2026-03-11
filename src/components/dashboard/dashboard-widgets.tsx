"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar as CalendarIcon, CheckCircle2, Plus, Clock, Video, FileText, Pencil } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { EditLessonModal } from "@/components/lessons/edit-lesson-modal"

type Reminder = {
    id: string
    text: string
    is_done: boolean
}

type Lesson = {
    id: string
    title: string
    date: string
    time: string
    status: string
    student_id: string
    student: {
        full_name: string
    }
}

export function DashboardWidgets() {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [newReminder, setNewReminder] = useState("")
    const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
    const [overdueCount, setOverdueCount] = useState(0)
    const [overdueTotal, setOverdueTotal] = useState(0)

    // Calendar Interaction
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false)
    const [selectedDayLessons, setSelectedDayLessons] = useState<Lesson[]>([])
    const [loadingLessons, setLoadingLessons] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

    const supabase = createClient()

    // Fetch Initial Data
    useEffect(() => {
        fetchReminders()
        fetchFinancialStats()
    }, [])

    // Open Day Details when date changes (if valid date)
    useEffect(() => {
        if (date) {
            fetchLessonsForDate(date)
        }
    }, [date])

    const fetchReminders = async () => {
        const { data } = await supabase
            .from('reminders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) setReminders(data)
    }

    const fetchFinancialStats = async () => {
        const { data } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'overdue')

        if (data) {
            setOverdueCount(data.length)
            setOverdueTotal(data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0))
        }
    }

    const fetchLessonsForDate = async (selectedDate: Date) => {
        setLoadingLessons(true)
        // Format to YYYY-MM-DD to match storage
        const dateStr = selectedDate.toLocaleDateString('pt-BR').split('/').reverse().join('-')
        // OR better: use toISOString split if timezone isn't an issue, but local date string is safer for simple text matches
        // Actually, we store as text YYYY-MM-DD. Let's ensure timezone correctness.
        // Quick fix: extract YYYY-MM-DD from the date object
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const formattedDate = `${year}-${month}-${day}`

        const { data } = await supabase
            .from('lessons')
            .select(`
                *,
                student:profiles(full_name)
            `)
            .eq('date', formattedDate)
            .order('time', { ascending: true })

        if (data) {
            // @ts-ignore
            setSelectedDayLessons(data)
            setIsDayDetailsOpen(true)
        }
        setLoadingLessons(false)
    }

    const addReminder = async () => {
        if (!newReminder.trim()) return

        const { error } = await supabase
            .from('reminders')
            .insert([{ text: newReminder }])

        if (!error) {
            setNewReminder("")
            setIsReminderDialogOpen(false)
            fetchReminders()
        }
    }

    const toggleReminder = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setReminders(reminders.map((r: Reminder) => r.id === id ? { ...r, is_done: !currentStatus } : r))

        await supabase
            .from('reminders')
            .update({ is_done: !currentStatus })
            .eq('id', id)

        fetchReminders() // Re-fetch to ensure sync
    }

    const deleteReminder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Excluir lembrete?')) return

        setReminders(reminders.filter((r: Reminder) => r.id !== id))
        await supabase.from('reminders').delete().eq('id', id)
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Alerts Section */}
            <Card className="col-span-1">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <CardTitle className="text-base">Avisos Importantes</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-start gap-4 rounded-md border p-3 hover:bg-accent transition-colors">
                        <div className={`h-2 w-2 mt-2 rounded-full ${overdueCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {overdueCount > 0 ? `${overdueCount} Pagamentos Atrasados` : 'Nenhum atraso'}
                            </p>
                            {overdueCount > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overdueTotal)}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Section */}
            <Card className="col-span-1">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-purple-500" />
                        <CardTitle className="text-base">Calendário</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex justify-center pb-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow-sm"
                    />
                </CardContent>

                {/* Day Details Dialog */}
                <Dialog open={isDayDetailsOpen} onOpenChange={setIsDayDetailsOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Aulas do Dia</DialogTitle>
                            <DialogDescription>
                                {date?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[300px] overflow-y-auto space-y-3 py-2">
                            {loadingLessons ? (
                                <div className="text-center text-sm">Carregando...</div>
                            ) : selectedDayLessons.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-4">
                                    Nenhuma aula agendada para este dia.
                                </div>
                            ) : (
                                selectedDayLessons.map((lesson: Lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between border p-3 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{lesson.title}</p>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.time}</span>
                                                <span>•</span>
                                                <span>{lesson.student?.full_name}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => setEditingLesson(lesson)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDayDetailsOpen(false)}>Fechar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* reuse edit modal */}
                <EditLessonModal
                    open={!!editingLesson}
                    onOpenChange={(open) => {
                        if (!open) setEditingLesson(null)
                    }}
                    lesson={editingLesson}
                    onSuccess={() => {
                        if (date) fetchLessonsForDate(date) // refresh list
                    }}
                />
            </Card>

            {/* Reminders Section */}
            <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <CardTitle className="text-base">Lembretes Rápidos</CardTitle>
                    </div>
                    <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Lembrete</DialogTitle>
                                <DialogDescription>
                                    Adicione uma tarefa rápida para não esquecer.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    id="reminder"
                                    placeholder="Ex: Falar com contador..."
                                    value={newReminder}
                                    onChange={(e) => setNewReminder(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addReminder()
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={addReminder}>Adicionar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-2 mt-4">
                    {reminders.map((reminder: Reminder) => (
                        <div
                            key={reminder.id}
                            className="flex items-center justify-between rounded-md border p-2 hover:bg-accent transition-colors group"
                        >
                            <div
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => toggleReminder(reminder.id, reminder.is_done)}
                            >
                                <div className={`h-4 w-4 rounded border flex items-center justify-center ${reminder.is_done ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                    {reminder.is_done && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <span className={`text-sm ${reminder.is_done ? 'text-muted-foreground line-through' : ''}`}>
                                    {reminder.text}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={(e) => deleteReminder(reminder.id, e)}
                            >
                                <span className="sr-only">Delete</span>
                                <span aria-hidden="true" className="text-muted-foreground hover:text-red-600">×</span>
                            </Button>
                        </div>
                    ))}
                    {reminders.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhum lembrete.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

