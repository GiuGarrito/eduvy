"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { format, addDays, isBefore, startOfDay, getDay, parse, isWithinInterval, startOfHour } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

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

    // Fetch availability rules and blocked dates on mount
    useEffect(() => {
        const fetchRules = async () => {
            const { data: rules } = await supabase.from('availability_weekly').select('*')
            if (rules) setAvailabilityRules(rules)

            const { data: blocked } = await supabase.from('blocked_dates').select('date, start_time, end_time')
            if (blocked) setBlockedDates(blocked)
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

            // 1. Check if date is FULLY blocked
            const blocksForDay = blockedDates.filter(b => b.date === dateStr)
            const isFullyBlocked = blocksForDay.some(b => !b.start_time || !b.end_time)

            if (isFullyBlocked) {
                setLoadingSlots(false)
                return // Fully blocked
            }

            // 2. Get availability rule for this day
            const rule = availabilityRules.find(r => r.day_of_week === dayOfWeek)
            if (!rule) {
                setLoadingSlots(false)
                return // No availability for this day of week
            }

            // 3. Get existing lessons for this date
            const { data: lessons } = await supabase
                .from('lessons')
                .select('time')
                .eq('date', dateStr)
                .neq('status', 'cancelled')

            const takenTimes = lessons?.map(l => l.time.substring(0, 5)) || [] // HH:MM

            // 4. Generate slots based on rule (Hourly slots for simplicity)
            const slots = []
            let current = parse(rule.start_time, 'HH:mm:ss', new Date())
            const end = parse(rule.end_time, 'HH:mm:ss', new Date())

            // Add slots every 60 minutes
            while (isBefore(current, end)) {
                const timeStr = format(current, 'HH:mm')

                // Check if slot overlaps with any partial block
                const slotIsBlocked = blocksForDay.some(b => {
                    if (!b.start_time || !b.end_time) return false // Handled above, but safety check

                    // Simple string comparison for HH:mm since valid format is guaranteed
                    // Slot is blocked if it starts at or after block start AND before block end
                    // (Assuming block is [start, end))
                    const bStart = b.start_time.slice(0, 5)
                    const bEnd = b.end_time.slice(0, 5)
                    return timeStr >= bStart && timeStr < bEnd
                })

                if (!takenTimes.includes(timeStr) && !slotIsBlocked) {
                    slots.push(timeStr)
                }
                // Add 1 hour
                current = new Date(current.getTime() + 60 * 60 * 1000)
            }

            setAvailableSlots(slots)
            setLoadingSlots(false)
        }

        fetchSlots()
    }, [date, availabilityRules, blockedDates, supabase])

    const handleSchedule = async (time: string) => {
        if (!date) return

        // 24h enforcement check (Client side)
        // Check if selected date+time is at least 24h from now
        const now = new Date()
        const selectedDateTime = parse(`${format(date, 'yyyy-MM-dd')} ${time}`, 'yyyy-MM-dd HH:mm', new Date())

        // Add 24 hours to now
        const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        if (isBefore(selectedDateTime, minDateTime)) {
            alert("Aulas devem ser agendadas com pelo menos 24 horas de antecedência.")
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
                time: time,
                student_id: user.id,
                status: 'scheduled'
            })

        if (error) {
            alert('Erro ao agendar aula. Tente novamente.')
        } else {
            alert('Aula agendada com sucesso!')
            router.push('/portal')
            router.refresh()
        }
        setSubmitting(false)
    }

    // Disable dates: Past dates + Less than 24h from NOW implies we *can* select tomorrow if time fits.
    // However, purely date-based disable:
    // If today is 28th 10:00, 24h from now is 29th 10:00.
    // So 28th is fully disabled. 29th is enabled (partial availability checked on slot selection).
    // So we disable dates strictly BEFORE today. Actually, even today is "before 24h" always.
    // So strictly, any date < tomorrow is impossible for 24h rule (unless checking specific time).
    // Let's disable all dates < tomorrow.
    // Actually, if it's 23:00 today, tomorrow 08:00 is < 24h.
    // But tomorrow 23:01 is > 24h. So tomorrow *could* stick be valid.
    // So we only disable dates BEFORE today? No, today is definitely out.
    // So disable dates <= today? No, if I check at 00:01, tomorrow 00:02 is > 24h.
    // Wait. 24h from NOW.
    // If now is 10AM, 24h later is tomorrow 10AM.
    // So tomorrow IS clickable.
    // Today is NEVER clickable (unless time travel exists).
    // So disable dates < tomorrow?
    // startOfDay(addDays(now, 1)) is tomorrow 00:00.
    // isBefore(date, startOfDay(addDays(now, 1))) -> disables today and past.
    // Correct.

    const isDateDisabled = (day: Date) => {
        const tomorrow = startOfDay(addDays(new Date(), 1))
        return isBefore(day, tomorrow)
    }

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
                <Card className="w-fit h-fit">
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={ptBR}
                            disabled={isDateDisabled}
                            className="rounded-md border shadow"
                        />
                    </CardContent>
                </Card>

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
                                                onClick={() => handleSchedule(time)}
                                                disabled={submitting}
                                                className="w-full"
                                            >
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
                        <div className="h-full flex items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed p-8">
                            Selecione uma data no calendário para ver os horários.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
