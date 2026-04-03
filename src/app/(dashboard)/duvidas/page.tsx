"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, CheckCircle, Clock, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Doubt = {
    id: string
    question: string
    answer: string | null
    created_at: string
    student_id: string
    student: {
        full_name: string
        email: string
    }
}

export default function AdminDoubtsPage() {
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [loading, setLoading] = useState(true)
    const [answeringId, setAnsweringId] = useState<string | null>(null)
    const [answerText, setAnswerText] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [filter, setFilter] = useState<"all" | "pending" | "answered">("pending")
    const [searchTerm, setSearchTerm] = useState("")

    const supabase = createClient()

    useEffect(() => {
        fetchDoubts()
    }, [])

    const fetchDoubts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('doubts')
            .select(`
                *,
                student:profiles!doubts_student_id_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Erro ao buscar dúvidas:", error)
            if (error.code === '42P01') {
                toast.error("Tabela de dúvidas não encontrada. Execute o script create_doubts_table.sql no Supabase.")
            } else {
                toast.error("Erro ao carregar dúvidas: " + error.message)
            }
        } else {
            // @ts-ignore
            setDoubts(data || [])
        }
        setLoading(false)
    }

    const handleAnswer = async (id: string) => {
        if (!answerText.trim()) return

        setSubmitting(true)
        const { error } = await supabase
            .from('doubts')
            .update({ answer: answerText })
            .eq('id', id)

        if (!error) {
            toast.success("Resposta enviada com sucesso!")
            setAnsweringId(null)
            setAnswerText("")
            fetchDoubts()
        } else {
            alert("Erro ao enviar resposta: " + error.message)
        }
        setSubmitting(false)
    }

    const filteredDoubts = doubts.filter(d => {
        const matchesFilter = 
            filter === "all" ? true :
            filter === "pending" ? !d.answer :
            !!d.answer

        const matchesSearch = 
            d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Dúvidas 💭</h1>
                    <p className="text-slate-500">Responda as perguntas dos seus alunos.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar por pergunta ou nome do aluno..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant={filter === "pending" ? "default" : "outline"}
                        onClick={() => setFilter("pending")}
                        size="sm"
                    >
                        Pendentes
                    </Button>
                    <Button 
                        variant={filter === "answered" ? "default" : "outline"}
                        onClick={() => setFilter("answered")}
                        size="sm"
                    >
                        Respondidas
                    </Button>
                    <Button 
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                        size="sm"
                    >
                        Todas
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Carregando dúvidas...</div>
                ) : filteredDoubts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg bg-slate-50">
                        {searchTerm ? "Nenhuma dúvida encontrada para sua busca." : "Nenhuma dúvida por enquanto."}
                    </div>
                ) : (
                    filteredDoubts.map((doubt: Doubt) => (
                        <Card key={doubt.id} className={!doubt.answer ? 'border-l-4 border-l-blue-500' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-slate-900">
                                                {doubt.student?.full_name || doubt.student?.email || "Aluno"}
                                            </span>
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">
                                                {new Date(doubt.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base leading-snug">{doubt.question}</CardTitle>
                                    </div>
                                    {!doubt.answer ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
                                            <Clock className="h-3 w-3" /> Pendente
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                                            <CheckCircle className="h-3 w-3" /> Respondida
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {doubt.answer ? (
                                    <div className="bg-slate-50 p-3 rounded-md border text-sm italic text-slate-600">
                                        <span className="font-bold text-slate-800 not-italic">Sua Resposta: </span> 
                                        {doubt.answer}
                                    </div>
                                ) : answeringId === doubt.id ? (
                                    <div className="space-y-3 mt-2">
                                        <Label htmlFor={`answer-${doubt.id}`}>Sua Resposta</Label>
                                        <Textarea 
                                            id={`answer-${doubt.id}`}
                                            placeholder="Digite sua resposta aqui..."
                                            value={answerText}
                                            onChange={(e) => setAnswerText(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setAnsweringId(null)}>Cancelar</Button>
                                            <Button size="sm" onClick={() => handleAnswer(doubt.id)} disabled={submitting}>
                                                Enviar Resposta
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setAnsweringId(doubt.id)}>
                                        Responder
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
