"use client"

import { useState, useEffect } from "react"
import { DollarSign } from "lucide-react"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface EditPaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    payment: any // Define stricter type if possible
    onSuccess?: () => void
}

export function EditPaymentModal({ open, onOpenChange, payment, onSuccess }: EditPaymentModalProps) {
    const [amount, setAmount] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("pending")
    const [loading, setLoading] = useState(false)
    const [studentName, setStudentName] = useState("")

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open && payment) {
            setAmount(payment.amount?.toString() || "")
            setDueDate(payment.due_date || "")
            setDescription(payment.description || "")
            setStatus(payment.status || "pending")
            setStudentName(payment.student?.full_name || payment.student?.email || "Aluno")
        }
    }, [open, payment])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('payments')
                .update({
                    amount: parseFloat(amount),
                    due_date: dueDate,
                    description,
                    status: status,
                    paid_at: status === 'paid' && payment.status !== 'paid' ? new Date().toISOString() : (status !== 'paid' ? null : payment.paid_at)
                })
                .eq('id', payment.id)

            if (error) throw error

            alert(`Cobrança atualizada!`)
            onOpenChange(false)
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Cobrança</DialogTitle>
                    <DialogDescription>
                        Editando cobrança de <strong>{studentName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
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
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus} required>
                            <SelectTrigger>
                                <SelectValue />
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
                            {loading ? 'Salvando...' : 'Atualizar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
