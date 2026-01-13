"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"

const weekDays = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
]

import { createClient } from "@/lib/supabase/client"
import { startOfWeek, addDays, format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Lesson {
    id: string
    title: string
    date: string // YYYY-MM-DD
    time: string // HH:mm
    student: {
        full_name: string
    }
}

export default function AgendaPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Calculate current week dates
    const today = new Date()
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
    const weekDates = weekDays.map((_, index) => addDays(startOfCurrentWeek, index))

    useEffect(() => {
        const fetchLessons = async () => {
            const startDate = format(startOfCurrentWeek, 'yyyy-MM-dd')
            const endDate = format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd') // Friday

            const { data, error } = await supabase
                .from('lessons')
                .select(`
                    id, title, date, time,
                    student:profiles(full_name)
                `)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('time')

            if (data) {
                // @ts-ignore
                setLessons(data)
            }
            setLoading(false)
        }

        fetchLessons()
    }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Agenda Semanal</h2>
                <p className="text-muted-foreground">
                    Semana de {format(startOfCurrentWeek, "dd/MM", { locale: ptBR })} a {format(addDays(startOfCurrentWeek, 4), "dd/MM", { locale: ptBR })}.
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 h-[calc(100vh-200px)]">
                {weekDates.map((dayDate, index) => {
                    const dayLessons = lessons.filter(l => l.date === format(dayDate, 'yyyy-MM-dd'))
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
                                        {dayLessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="p-3 bg-white rounded-md border shadow-sm text-sm hover:border-blue-400 transition-colors cursor-default"
                                            >
                                                <div className="font-bold text-blue-600">{lesson.time.slice(0, 5)}</div>
                                                <div className="font-medium truncate" title={lesson.student?.full_name}>
                                                    {lesson.student?.full_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">{lesson.title}</div>
                                            </div>
                                        ))}
                                        {dayLessons.length === 0 && (
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
        </div>
    )
}
