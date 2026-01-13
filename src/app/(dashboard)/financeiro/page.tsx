"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, AlertCircle, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { AddPaymentModal } from "@/components/finance/add-payment-modal"
import { EditPaymentModal } from "@/components/finance/edit-payment-modal"

interface Payment {
    id: string
    amount: number
    status: 'paid' | 'pending' | 'overdue'
    due_date: string
    description: string
    paid_at?: string
    student: {
        full_name: string
        email: string
    }
}

export default function FinancialPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    student:profiles(full_name, email)
                `)
                .order('due_date', { ascending: false })

            if (data) {
                // @ts-ignore
                setPayments(data)
            }
            setLoading(false)
        }

        fetchPayments()

        // Realtime subscription could be added here similar to LessonsPage
    }, [supabase, isAddPaymentOpen]) // Refresh when modal closes/changes

    // Calculations
    const received = payments
        .filter(p => p.status === 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0)

    const receivable = payments
        .filter(p => p.status === 'pending')
        .reduce((acc, curr) => acc + curr.amount, 0)

    const overdue = payments
        .filter(p => p.status === 'overdue')

    const overdueAmount = overdue.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
                <Button onClick={() => setIsAddPaymentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Cobrança
                </Button>
            </div>

            <AddPaymentModal
                open={isAddPaymentOpen}
                onOpenChange={setIsAddPaymentOpen}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Recebido Total
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(received)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pagamentos confirmados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            A Receber
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receivable)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Mensalidades pendentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Qtd. Atrasos
                        </CardTitle>
                        <Users className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {overdue.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Alunos inadimplentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Valor em Atraso
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(overdueAmount)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Requer cobrança
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">Carregando financeiro...</div>
                        ) : (
                            <div className="space-y-4">
                                {payments.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        Nenhum registro financeiro encontrado.
                                    </div>
                                )}
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium">{payment.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Aluno: <span className="text-foreground font-medium">{payment.student?.full_name || payment.student?.email}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {payment.status === 'paid' ? 'Pago' :
                                                    payment.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4 border-l pl-4 border-slate-100">
                                            {payment.status !== 'paid' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                                                    onClick={async () => {
                                                        const confirm = window.confirm(`Confirmar pagamento de ${payment.description}?`)
                                                        if (!confirm) return

                                                        const { error } = await supabase
                                                            .from('payments')
                                                            .update({ status: 'paid', paid_at: new Date().toISOString() })
                                                            .eq('id', payment.id)

                                                        if (error) alert('Erro ao atualizar')
                                                        else {
                                                            // Trigger refresh or state update
                                                            setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid' } : p))
                                                        }
                                                    }}
                                                >
                                                    Dar Baixa
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 h-7 text-xs"
                                                onClick={async () => {
                                                    const confirm = window.confirm(`Excluir cobrança de ${payment.description}?`)
                                                    if (!confirm) return

                                                    const { error } = await supabase
                                                        .from('payments')
                                                        .delete()
                                                        .eq('id', payment.id)

                                                    if (error) alert('Erro ao excluir')
                                                    else {
                                                        setPayments(prev => prev.filter(p => p.id !== payment.id))
                                                    }
                                                }}
                                            >
                                                Excluir
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => setEditingPayment(payment)}
                                            >
                                                Editar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditPaymentModal
                open={!!editingPayment}
                onOpenChange={(open) => !open && setEditingPayment(null)}
                payment={editingPayment}
                onSuccess={() => {
                    // Slight hack to re-fetch, better to extract fetch function
                    setIsAddPaymentOpen(prev => !prev)
                    // Actually, simpler to verify logic or make fetch dependency correct. 
                    // Let's rely on the useEffect dependency [isAddPaymentOpen]. 
                    // We can toggle it or add another dependency.
                    // For now, let's just force a reload via window or toggle a counter.
                    // Ideally, we extract fetchPayments. For quick fix:
                    window.location.reload()
                }}
            />
        </div >
    )
}
