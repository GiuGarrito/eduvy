"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Trash2, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"

interface Availability {
    id: string
    day_of_week: number
    start_time: string
    end_time: string
}

interface BlockedDate {
    id: string
    date: string
    reason: string
    start_time?: string
    end_time?: string
}

const WEEKDAYS = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
]

export default function DisponibilidadePage() {
    const supabase = createClient()
    const [availability, setAvailability] = useState<Availability[]>([])
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
    const [loading, setLoading] = useState(true)

    // Form states
    const [newDay, setNewDay] = useState<string>("1")
    const [newStart, setNewStart] = useState("09:00")
    const [newEnd, setNewEnd] = useState("17:00")

    // Block Date Form
    const [blockDate, setBlockDate] = useState<Date | undefined>(undefined)
    const [isPartialBlock, setIsPartialBlock] = useState(false)
    const [blockStartTime, setBlockStartTime] = useState("08:00")
    const [blockEndTime, setBlockEndTime] = useState("12:00")


    const fetchData = async () => {
        setLoading(true)
        const { data: avail } = await supabase.from('availability_weekly').select('*').order('day_of_week').order('start_time')
        const { data: blocked } = await supabase.from('blocked_dates').select('*').order('date')

        if (avail) setAvailability(avail)
        if (blocked) setBlockedDates(blocked)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [supabase])

    const handleAddAvailability = async () => {
        const { error } = await supabase.from('availability_weekly').insert({
            day_of_week: parseInt(newDay),
            start_time: newStart,
            end_time: newEnd
        })

        if (error) {
            alert('Erro ao adicionar disponibilidade')
            console.error(error)
        } else {
            fetchData()
        }
    }

    const handleDeleteAvailability = async (id: string) => {
        await supabase.from('availability_weekly').delete().eq('id', id)
        fetchData()
    }

    const handleBlockDate = async () => {
        if (!blockDate) return
        const dateStr = format(blockDate, 'yyyy-MM-dd')

        const payload: any = {
            date: dateStr,
            reason: 'Bloqueado pelo professor'
        }

        if (isPartialBlock) {
            payload.start_time = blockStartTime
            payload.end_time = blockEndTime
        }

        const { error } = await supabase.from('blocked_dates').insert(payload)

        if (error) {
            alert('Erro ao bloquear data (talvez já esteja bloqueada?)')
            console.error(error)
        } else {
            setBlockDate(undefined)
            setIsPartialBlock(false)
            fetchData()
        }
    }

    const handleUnblockDate = async (id: string) => {
        await supabase.from('blocked_dates').delete().eq('id', id)
        fetchData()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/agenda">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gerenciar Disponibilidade</h2>
                    <p className="text-muted-foreground">
                        Defina seus horários de atendimento recorrentes e dias de folga.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Weekly Availability */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horários Semanais</CardTitle>
                        <CardDescription>Adicione intervalos de horário fixos por dia da semana.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="grid gap-2 flex-1">
                                <Label>Dia da Semana</Label>
                                <Select value={newDay} onValueChange={setNewDay}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WEEKDAYS.map((day: { value: number, label: string }) => (
                                            <SelectItem key={day.value} value={day.value.toString()}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2 w-24">
                                <Label>Início</Label>
                                <Input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} />
                            </div>
                            <div className="grid gap-2 w-24">
                                <Label>Fim</Label>
                                <Input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
                            </div>
                            <Button onClick={handleAddAvailability} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            ) : availability.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum horário definido.</p>
                            ) : (
                                availability.map((item: Availability) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {WEEKDAYS.find((d: { value: number, label: string }) => d.value === item.day_of_week)?.label}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAvailability(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Blocked Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bloquear Datas/Horários</CardTitle>
                        <CardDescription>Selecione dias específicos para não aceitar agendamentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <Calendar
                                mode="single"
                                selected={blockDate}
                                onSelect={setBlockDate}
                                locale={ptBR}
                                className="rounded-md border shadow"
                            />

                            <div className="w-full space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="partial-block"
                                        checked={isPartialBlock}
                                        onCheckedChange={(c) => setIsPartialBlock(c as boolean)}
                                    />
                                    <Label htmlFor="partial-block">Bloquear apenas um horário</Label>
                                </div>

                                {isPartialBlock && (
                                    <div className="flex gap-2">
                                        <div className="grid gap-2 flex-1">
                                            <Label>Início</Label>
                                            <Input type="time" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label>Fim</Label>
                                            <Input type="time" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <Button onClick={handleBlockDate} disabled={!blockDate} className="w-full">
                                    {isPartialBlock ? 'Bloquear Horário' : 'Bloquear Dia Inteiro'}
                                </Button>
                            </div>
                        </div>

                        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                            {blockedDates.map((block: BlockedDate) => (
                                <li key={block.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{format(new Date(block.date.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
                                        {block.start_time && block.end_time ? (
                                            <span className="text-xs text-red-600">
                                                Bloqueado: {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-600">Dia Inteiro Bloqueado</span>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUnblockDate(block.id)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </li>
                            ))}
                            {blockedDates.length === 0 && (
                                <li className="text-center text-xs text-muted-foreground py-2">
                                    Nenhuma data bloqueada.
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
