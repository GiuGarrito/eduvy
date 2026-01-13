import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, FileText, Check, Upload, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock Data
const invoices = [
    { id: 1, month: "Janeiro 2026", amount: "R$ 350,00", status: "open", dueDate: "10/01/2026" },
    { id: 2, month: "Dezembro 2025", amount: "R$ 350,00", status: "paid", dueDate: "10/12/2025" },
    { id: 3, month: "Novembro 2025", amount: "R$ 350,00", status: "paid", dueDate: "10/11/2025" },
]

export default function StudentFinancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Financeiro 💸</h1>
                <p className="text-muted-foreground">Gerencie suas mensalidades.</p>
            </div>

            <div className="space-y-4">
                {invoices.map((invoice) => (
                    <Card key={invoice.id} className={`overflow-hidden ${invoice.status === 'open' ? 'border-primary' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                            <CardTitle className="text-base font-medium">
                                {invoice.month}
                            </CardTitle>
                            {invoice.status === 'open' ? (
                                <Badge>Em Aberto</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-baseline mb-4">
                                <span className="text-2xl font-bold">{invoice.amount}</span>
                                <span className="text-xs text-muted-foreground">Vence em {invoice.dueDate}</span>
                            </div>

                            {invoice.status === 'open' && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Fazer Pagamento
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Pagamento - {invoice.month}</DialogTitle>
                                            <DialogDescription>
                                                Realize o pagamento via PIX e anexe o comprovante abaixo.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid w-full gap-6 py-4">
                                            {/* PIX Key Section */}
                                            <div className="bg-muted p-4 rounded-lg space-y-2 text-center">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Chave PIX (Email)</Label>
                                                <div className="flex items-center justify-center gap-2">
                                                    <code className="bg-background px-2 py-1 rounded border font-mono text-sm relative">
                                                        financeiro@pilatesstudio.com.br
                                                    </code>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Copiar">
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Studio Pilates LTDA • CNPJ 00.000.000/0001-00</p>
                                            </div>

                                            {/* Upload Section */}
                                            <div className="space-y-3">
                                                <Label htmlFor="file" className="font-semibold">Anexar Comprovante</Label>
                                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                    <span className="text-sm text-foreground">Clique para selecionar</span>
                                                    <span className="text-xs text-muted-foreground">PDF, JPG ou PNG</span>
                                                    <Input id="file" type="file" accept=".pdf,image/*" className="hidden" />
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800 flex items-start">
                                                <Clock className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                                <span>O pagamento será validado após o envio do comprovante.</span>
                                            </div>
                                        </div>
                                        <Button className="w-full">Enviar Comprovante</Button>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {invoice.status === 'paid' && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                    Pagamento confirmado
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
