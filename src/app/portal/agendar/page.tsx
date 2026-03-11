"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { format, addDays, isBefore, startOfDay, getDay, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, ArrowLeft, CalendarCheck, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Availability {
    day_of_week: number
    start_time: string
    end_time: string
}

interface BlockedDate {
    date: string
    start_time?: string
    end_time?: string
}

export default function AgendarAulaPage() {
    const router = useRouter()
    const supabase = createClient()
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [availabilityRules, setAvailabilityRules] = useState<Availability[]>([])
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [studentBookedDates, setStudentBookedDates] = useState<string[]>([]) // YYYY-MM-DD dates with lessons

    // Confirmation dialog state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Fetch availability rules, blocked dates, and student's booked dates on mount
    useEffect(() => {
        const fetchRules = async () => {
            const { data: rules } = await supabase.from('availability_weekly').select('*')
            if (rules) setAvailabilityRules(rules)

            const { data: blocked } = await supabase.from('blocked_dates').select('date, start_time, end_time')
            if (blocked) setBlockedDates(blocked)

            // Fetch student's own upcoming lessons to block those dates
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const today = format(new Date(), 'yyyy-MM-dd')
                const { data: myLessons } = await supabase
                    .from('lessons')
                    .select('date')
                    .eq('student_id', user.id)
                    .gte('date', today)
                    .neq('status', 'cancelled')

                if (myLessons) {
                    setStudentBookedDates(myLessons.map((l: { date: string }) => l.date))
                }
            }
        }
        fetchRules()
    }, [supabase])

    // Fetch slots when date changes
    useEffect(() => {
        if (!date) return

        const fetchSlots = async () => {
            setLoadingSlots(true)
            setAvailableSlots([])

            const dateStr = format(date, 'yyyy-MM-dd')
            const dayOfWeek = getDay(date)

            // 1. Check if date is FULLY blocked by admin
            const blocksForDay = blockedDates.filter(b => b.date === dateStr)
            const isFullyBlocked = blocksForDay.some(b => !b.start_time || !b.end_time)

            if (isFullyBlocked) {
                setLoadingSlots(false)
                return
            }

            // 2. Get availability rule for this day
            const rule = availabilityRules.find(r => r.day_of_week === dayOfWeek)
            if (!rule) {
                setLoadingSlots(false)
                return
            }

            // 3. Get ALL existing lessons for this date (all students)
            const { data: lessons } = await supabase
                .from('lessons')
                .select('time')
                .eq('date', dateStr)
                .neq('status', 'cancelled')

            const takenTimes = lessons?.map((l: { time: string }) => l.time.substring(0, 5)) || []

            // 4. Generate slots based on rule (Hourly slots)
            const slots = []
            let current = parse(rule.start_time, 'HH:mm:ss', new Date())
            const end = parse(rule.end_time, 'HH:mm:ss', new Date())

            while (isBefore(current, end)) {
                const timeStr = format(current, 'HH:mm')

                const slotIsBlocked = blocksForDay.some(b => {
                    if (!b.start_time || !b.end_time) return false
                    const bStart = b.start_time.slice(0, 5)
                    const bEnd = b.end_time.slice(0, 5)
                    return timeStr >= bStart && timeStr < bEnd
                })

                if (!takenTimes.includes(timeStr) && !slotIsBlocked) {
                    slots.push(timeStr)
                }
                current = new Date(current.getTime() + 60 * 60 * 1000)
            }

            setAvailableSlots(slots)
            setLoadingSlots(false)
        }

        fetchSlots()
    }, [date, availabilityRules, blockedDates, supabase])

    // Opens confirmation dialog instead of directly scheduling
    const handleTimeClick = (time: string) => {
        setSelectedTime(time)
        setConfirmOpen(true)
    }

    // Called when user clicks "Confirmar" in the dialog
    const handleConfirm = async () => {
        if (!date || !selectedTime) return

        const now = new Date()
        const selectedDateTime = parse(`${format(date, 'yyyy-MM-dd')} ${selectedTime}`, 'yyyy-MM-dd HH:mm', new Date())
        const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        if (isBefore(selectedDateTime, minDateTime)) {
            alert("Aulas devem ser agendadas com pelo menos 24 horas de antecedência.")
            setConfirmOpen(false)
            return
        }

        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const dateStr = format(date, 'yyyy-MM-dd')

        const { error } = await supabase
            .from('lessons')
            .insert({
                title: 'Aula Agendada',
                date: dateStr,
                time: selectedTime,
                student_id: user.id,
                status: 'scheduled'
            })

        setConfirmOpen(false)
        setSubmitting(false)

        if (error) {
            alert('Erro ao agendar aula. Tente novamente.')
        } else {
            router.push('/portal')
            router.refresh()
        }
    }

    // Disable dates: past days and today. Only tomorrow onwards is allowed.
    const isDateDisabled = (day: Date) => {
        const tomorrow = startOfDay(addDays(new Date(), 1))
        if (isBefore(day, tomorrow)) return true

        return false
    }

    const formattedDate = date
        ? format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        : ''

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/portal">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Agendar Aula</h1>
                    <p className="text-muted-foreground">Escolha um dia e horário com pelo menos 24 horas de antecedência.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-[auto_1fr] gap-8">
                <div className="flex justify-center w-full md:w-fit">
                    <Card className="w-full max-w-[400px] md:w-fit h-fit border-none shadow-none md:border md:shadow-sm">
                        <CardContent className="p-0 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={ptBR}
                                disabled={isDateDisabled}
                                className="rounded-md border shadow-md scale-110 sm:scale-100 origin-top"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {date ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Horários Disponíveis</CardTitle>
                                <CardDescription>
                                    Para {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                    <br />
                                    <span className="text-xs font-medium text-blue-600">Duração da aula: 55 minutos</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingSlots ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {availableSlots.map((time) => (
                                            <Button
                                                key={time}
                                                variant="outline"
                                                onClick={() => handleTimeClick(time)}
                                                disabled={submitting}
                                                className="w-full flex items-center gap-2"
                                            >
                                                <Clock className="h-4 w-4 text-primary" />
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhum horário disponível para este dia.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed p-8 gap-3">
                            <CalendarCheck className="h-10 w-10 text-muted-foreground/50" />
                            <p>Selecione uma data no calendário para ver os horários disponíveis.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Confirmar Agendamento
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 pt-1">
                                <p>Você gostaria de agendar sua aula para:</p>
                                <div className="bg-muted rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2 font-medium text-foreground">
                                        <CalendarCheck className="h-4 w-4 text-primary" />
                                        <span className="capitalize">{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-medium text-foreground">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span>às {selectedTime}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ao confirmar, sua aula será registrada e você poderá visualizá-la na seção <strong>Minhas Aulas</strong>.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="flex items-center gap-2"
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Agendando...</>
                            ) : (
                                'Confirmar Agendamento'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
