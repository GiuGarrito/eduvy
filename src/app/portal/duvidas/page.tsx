"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Doubt = {
    id: string
    question: string
    answer: string | null
    created_at: string
}

export default function DoubtsPage() {
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [newQuestion, setNewQuestion] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchDoubts()
    }, [])

    const fetchDoubts = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
            .from('doubts')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })

        if (!error) {
            setDoubts(data || [])
        }
        setLoading(false)
    }

    const handleSend = async () => {
        if (!newQuestion.trim()) return

        setSending(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('doubts')
                .insert([{
                    student_id: user.id,
                    question: newQuestion,
                }])

            if (!error) {
                setNewQuestion("")
                fetchDoubts()
            } else {
                alert("Erro ao enviar dúvida: " + error.message)
            }
        }
        setSending(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dúvidas 💭</h1>
                <p className="text-muted-foreground">Fale diretamente com nossa equipe.</p>
            </div>

            {/* Ask Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Nova Pergunta</CardTitle>
                    <CardDescription>Envie sua dúvida sobre treinos, dores ou nutrição.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="question">Sua Dúvida</Label>
                        <Textarea
                            id="question"
                            placeholder="Escreva aqui..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSend} disabled={!newQuestion.trim() || sending}>
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Enviando...' : 'Enviar Pergunta'}
                    </Button>
                </CardFooter>
            </Card>

            {/* History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Histórico de Mensagens</h2>
                {loading ? (
                    <div className="text-center text-muted-foreground">Carregando...</div>
                ) : doubts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        Você ainda não enviou nenhuma dúvida.
                    </div>
                ) : (
                    doubts.map((doubt: Doubt) => (
                        <Card key={doubt.id} className={!doubt.answer ? 'border-dashed' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="space-y-1">
                                            <CardTitle className="text-base leading-none">{doubt.question}</CardTitle>
                                            <CardDescription>
                                                {new Date(doubt.created_at).toLocaleDateString('pt-BR')} às {new Date(doubt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {!doubt.answer && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Aguardando</span>
                                    )}
                                </div>
                            </CardHeader>
                            {doubt.answer && (
                                <CardContent className="bg-muted/30 pt-4 border-t">
                                    <p className="text-sm"><span className="font-semibold text-primary">Resposta:</span> {doubt.answer}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

