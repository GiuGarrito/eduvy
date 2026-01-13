"use client"

import { useState, useEffect } from "react"
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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateStudentPassword } from "@/app/actions/students"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditStudentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: {
        id: string
        full_name: string
        email: string
        monthly_fee?: number
        due_day?: number
    }
    onSuccess?: () => void
}

export function EditStudentModal({ open, onOpenChange, student, onSuccess }: EditStudentModalProps) {
    const [fullName, setFullName] = useState(student.full_name)
    const [email, setEmail] = useState(student.email)
    const [monthlyFee, setMonthlyFee] = useState(student.monthly_fee?.toString() || "")
    const [dueDay, setDueDay] = useState(student.due_day?.toString() || "")

    // Password state
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open) {
            setFullName(student.full_name)
            setEmail(student.email)
            setMonthlyFee(student.monthly_fee?.toString() || "")
            setDueDay(student.due_day?.toString() || "")
            setNewPassword("")
        }
    }, [open, student])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    // email: email, // Usually changing email requires auth updates, let's stick to metadata for now
                    monthly_fee: monthlyFee ? parseFloat(monthlyFee) : null,
                    due_day: dueDay ? parseInt(dueDay) : null
                })
                .eq('id', student.id)

            if (error) throw error

            alert('Aluno atualizado com sucesso!')
            onOpenChange(false)
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error: any) {
            alert('Erro ao atualizar aluno: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        setChangingPassword(true)
        const result = await updateStudentPassword(student.id, newPassword)

        if (result.error) {
            alert(result.error)
        } else {
            alert('Senha atualizada com sucesso!')
            setNewPassword("")
        }
        setChangingPassword(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Aluno</DialogTitle>
                    <DialogDescription>
                        Gerencie os dados e acesso deste aluno.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="security">Segurança</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fee">Mensalidade (R$)</Label>
                                    <Input
                                        id="fee"
                                        type="number"
                                        step="0.01"
                                        value={monthlyFee}
                                        onChange={(e) => setMonthlyFee(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDay">Dia de Vencimento</Label>
                                    <Input
                                        id="dueDay"
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={dueDay}
                                        onChange={(e) => setDueDay(e.target.value)}
                                        placeholder="Dia"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPass">Nova Senha</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="newPass"
                                    type="text"
                                    placeholder="Digite a nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button onClick={handlePasswordChange} disabled={changingPassword} variant="destructive">
                                    {changingPassword ? 'Alterando...' : 'Redefinir'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                O aluno perderá o acesso com a senha antiga imediatamente.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

