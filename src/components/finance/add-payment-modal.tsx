
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Student {
    id: string
    full_name: string
    email: string
}


interface AddPaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultStudentId?: string
}

export function AddPaymentModal({ open, onOpenChange, defaultStudentId }: AddPaymentModalProps) {
    const [studentId, setStudentId] = useState(defaultStudentId || "")
    const [amount, setAmount] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("pending")
    const [loading, setLoading] = useState(false)

    // Real data state
    const [students, setStudents] = useState<Student[]>([])
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open) {
            const fetchStudents = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .eq('role', 'student')

                if (data) {
                    setStudents(data)
                }
            }
            fetchStudents()
        }
    }, [open, supabase])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('payments')
                .insert({
                    student_id: studentId,
                    amount: parseFloat(amount),
                    due_date: dueDate,
                    description,
                    status: status,
                    // If paid, we should probably set paid_at, but for now let's keep it simple
                    paid_at: status === 'paid' ? new Date().toISOString() : null
                })

            if (error) throw error

            alert(`Cobrança criada com sucesso!`)
            onOpenChange(false)
            router.refresh()

            // Reset form
            setStudentId("")
            setAmount("")
            setDueDate("")
            setDescription("")
            setStatus("pending")
        } catch (error: any) {
            alert('Erro ao criar cobrança: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Cobrança</DialogTitle>
                    <DialogDescription>
                        Lançar novo pagamento ou mensalidade.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="student">Aluno</Label>
                        <Select value={studentId} onValueChange={setStudentId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.full_name || student.email}
                                    </SelectItem>
                                ))}
                                {students.length === 0 && (
                                    <SelectItem value="none" disabled>Nenhum aluno encontrado</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Mensalidade Fevereiro/2026"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    className="pl-8"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Vencimento</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status Inicial</Label>
                        <Select value={status} onValueChange={setStatus} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendente (A Receber)</SelectItem>
                                <SelectItem value="paid">Pago (Recebido)</SelectItem>
                                <SelectItem value="overdue">Atrasado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Criar Cobrança'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
