"use client"

import { useState, useEffect } from "react"
import { DollarSign, Calendar as CalendarIcon } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface PaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    studentName: string
    monthlyFee: number
}

export function PaymentModal({
    open,
    onOpenChange,
    studentName,
    monthlyFee,
}: PaymentModalProps) {
    const [paymentType, setPaymentType] = useState<"full" | "partial">("full")
    const [amount, setAmount] = useState<string>("")
    const [date, setDate] = useState<string>("")
    const [notes, setNotes] = useState<string>("")

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setPaymentType("full")
            setAmount(monthlyFee.toFixed(2))
            setDate(new Date().toISOString().split("T")[0]) // Today YYYY-MM-DD
            setNotes("")
        }
    }, [open, monthlyFee])

    // Update amount when toggling full/partial
    useEffect(() => {
        if (paymentType === "full") {
            setAmount(monthlyFee.toFixed(2))
        }
    }, [paymentType, monthlyFee])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Mock submission
        console.log("Payment Submitted:", {
            student: studentName,
            type: paymentType,
            amount: parseFloat(amount),
            date,
            notes
        })

        alert(`Pagamento de R$ ${amount} registrado com sucesso para ${studentName}!`)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>
                        Lance um novo pagamento para <strong>{studentName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Tipo de Pagamento</Label>
                        <RadioGroup
                            defaultValue="full"
                            value={paymentType}
                            onValueChange={(v) => setPaymentType(v as "full" | "partial")}
                            className="flex flex-row gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="full" id="r-full" />
                                <Label htmlFor="r-full">Integral (R$ {monthlyFee.toFixed(2)})</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="partial" id="r-partial" />
                                <Label htmlFor="r-partial">Parcial / Outro</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    className="pl-9"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    // Disable editing if Full is selected, or let them edit but switch to partial? 
                                    // Requirement: "Automático se Integral, Editável se Parcial"
                                    disabled={paymentType === "full"}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <div className="relative">
                                {/* <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Observação (Opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ex: Pago via PIX, Desconto aplicado..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Confirmar Pagamento</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
