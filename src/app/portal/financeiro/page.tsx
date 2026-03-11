import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, FileText, Check, Upload, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function StudentFinancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Student Profile info (due_day, monthly_fee)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 2. Fetch Admin's PIX Key
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('pix_key')
        .eq('role', 'admin')
        .limit(1)
        .single()

    const adminPixKey = adminProfile?.pix_key || 'Chave PIX não configurada pela professora'
    const dueDay = profile?.due_day
    const monthlyFee = profile?.monthly_fee || 0

    // Logic for Current Month Invoice
    const hoje = new Date()
    const mesAtual = hoje.toLocaleString('pt-BR', { month: 'long' })
    const anoAtual = hoje.getFullYear()
    const nomeMesMaiusculo = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)

    let diasAteVencimento = 0
    let estaAtrasado = false
    let isVencimentoAtivo = false

    if (dueDay) {
        isVencimentoAtivo = true
        const dataVencimento = new Date(anoAtual, hoje.getMonth(), dueDay)
        
        const date1 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
        const date2 = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), dataVencimento.getDate())
        
        const tempoDiff = date2.getTime() - date1.getTime()
        diasAteVencimento = Math.ceil(tempoDiff / (1000 * 3600 * 24))

        if (diasAteVencimento < 0) {
            estaAtrasado = true
        }
    }

    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyFee)

    // Mock Past Invoices just for visual
    const pastInvoices = [
        { id: 2, month: "Dezembro 2025", amount: valorFormatado, status: "paid", dueDate: `${dueDay}/12/2025` },
        { id: 3, month: "Novembro 2025", amount: valorFormatado, status: "paid", dueDate: `${dueDay}/11/2025` },
    ]

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Financeiro 💸</h1>
                <p className="text-muted-foreground">Gerencie suas mensalidades.</p>
            </div>

            {/* Current Month Active Invoice */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold mt-8 mb-2">Mensalidade Atual</h2>
                
                {isVencimentoAtivo ? (
                    <Card className={`overflow-hidden border-2 ${estaAtrasado ? 'border-red-500' : 'border-primary'}`}>
                        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${estaAtrasado ? 'bg-red-50' : 'bg-primary/10'}`}>
                            <CardTitle className="text-base font-medium">
                                {nomeMesMaiusculo} {anoAtual}
                            </CardTitle>
                            {estaAtrasado ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />Em Atraso
                                </Badge>
                            ) : (
                                <Badge className="bg-primary text-primary-foreground">Em Aberto</Badge>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className={`text-3xl font-bold ${estaAtrasado ? 'text-red-600' : ''}`}>
                                    {valorFormatado}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                                    Vencimento: Dia {dueDay}
                                </span>
                            </div>

                            {estaAtrasado && (
                                <p className="text-sm text-red-600 mb-4 font-medium">
                                    Sua mensalidade está atrasada há {Math.abs(diasAteVencimento)} dias. Efetue o pagamento o quanto antes.
                                </p>
                            )}

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant={estaAtrasado ? "destructive" : "default"}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Fazer Pagamento via PIX
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Pagamento - {nomeMesMaiusculo} {anoAtual}</DialogTitle>
                                        <DialogDescription>
                                            Realize o pagamento via PIX para sua professora e envie o comprovante pelo WhatsApp ou guarde com você.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-6 py-4">
                                        <div className="bg-muted p-4 rounded-lg space-y-3 text-center border">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
                                                Chave PIX da Professora
                                            </Label>
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <code className="bg-background px-4 py-3 text-lg rounded border-2 font-mono text-primary font-bold w-full break-all">
                                                    {adminPixKey}
                                                </code>
                                            </div>
                                            <p className="text-sm text-foreground space-y-1">
                                                Valor a transferir: <strong className="text-lg">{valorFormatado}</strong>
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800 flex flex-col gap-2">
                                            <div className="flex items-start">
                                                <Clock className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                                <span className="font-semibold">Como funciona a baixa do pagamento?</span>
                                            </div>
                                            <span className="text-blue-700 ml-6">
                                                No momento, sua professora dará baixa manual na sua mensalidade assim que receber o Pix. Se preferir, envie o comprovante diretamente no WhatsApp dela!
                                            </span>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground pt-6">
                            Sua data de vencimento ainda não foi configurada pela professora.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Historical Invoices */}
            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold text-muted-foreground">Histórico Anterior (Simulado)</h3>
                <div className="opacity-70 grayscale">
                    {pastInvoices.map((invoice) => (
                        <Card key={invoice.id} className="mb-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <CardTitle className="text-base font-medium text-muted-foreground">
                                    {invoice.month}
                                </CardTitle>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">Pago</Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-bold text-muted-foreground">{invoice.amount}</span>
                                    <span className="text-xs text-muted-foreground">Pago em {invoice.dueDate}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
        </div>
    )
}
