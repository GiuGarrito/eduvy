"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Megaphone, Pencil, MessageCircle, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

type Announcement = {
    id: string
    title: string
    content: string
    created_at: string
}

type Doubt = {
    id: string
    question: string
    answer: string | null
    created_at: string
    status: 'pending' | 'answered' // deduced helper
    student: {
        full_name: string
        email: string
    }
}

export default function AvisosPage() {
    const [activeTab, setActiveTab] = useState("announcements")

    // Announcements State
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [saving, setSaving] = useState(false)

    // Doubts State
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [loadingDoubts, setLoadingDoubts] = useState(false)
    const [answeringDoubt, setAnsweringDoubt] = useState<Doubt | null>(null)
    const [answerText, setAnswerText] = useState("")

    const supabase = createClient()

    useEffect(() => {
        fetchAnnouncements()
        fetchDoubts()
    }, [])

    // --- Announcements Logic ---

    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true)
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setAnnouncements(data || [])
        setLoadingAnnouncements(false)
    }

    const resetForm = () => {
        setTitle("")
        setContent("")
        setEditingAnnouncement(null)
        setIsCreateOpen(false)
    }

    const handleSaveAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        if (editingAnnouncement) {
            // Update
            const { error } = await supabase
                .from('announcements')
                .update({ title, content })
                .eq('id', editingAnnouncement.id)

            if (!error) {
                alert('Aviso atualizado!')
                fetchAnnouncements()
                resetForm()
            } else {
                alert('Erro ao atualizar: ' + error.message)
            }
        } else {
            // Create
            const { error } = await supabase
                .from('announcements')
                .insert([{ title, content }])

            if (!error) {
                alert('Aviso criado com sucesso!')
                fetchAnnouncements()
                resetForm()
            } else {
                alert('Erro ao criar: ' + error.message)
            }
        }
        setSaving(false)
    }

    const openEditModal = (a: Announcement) => {
        setEditingAnnouncement(a)
        setTitle(a.title)
        setContent(a.content)
        setIsCreateOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este aviso?')) return

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id)

        if (!error) fetchAnnouncements()
    }

    // --- Doubts Logic ---

    const fetchDoubts = async () => {
        setLoadingDoubts(true)
        const { data, error } = await supabase
            .from('doubts')
            .select(`
                *,
                student:profiles(full_name, email)
            `)
            .order('created_at', { ascending: false })

        if (!error) {
            // @ts-ignore
            setDoubts(data || [])
        }
        setLoadingDoubts(false)
    }

    const handleAnswerDoubt = async () => {
        if (!answeringDoubt || !answerText.trim()) return

        const { error } = await supabase
            .from('doubts')
            .update({
                answer: answerText,
                answered_at: new Date().toISOString()
            })
            .eq('id', answeringDoubt.id)

        if (!error) {
            alert('Resposta enviada!')
            setAnsweringDoubt(null)
            setAnswerText("")
            fetchDoubts()
        } else {
            alert('Erro ao responder: ' + error.message)
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Comunicação</h2>
                <p className="text-muted-foreground">Gerencie avisos e responda dúvidas dos alunos.</p>
            </header>

            <Tabs defaultValue="announcements" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="announcements">Avisos</TabsTrigger>
                    <TabsTrigger value="doubts" className="relative">
                        Dúvidas
                        {doubts.filter(d => !d.answer).length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* --- Tab: Announcements --- */}
                <TabsContent value="announcements" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => { resetForm(); setIsCreateOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Aviso
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {loadingAnnouncements ? (
                            <div className="text-center py-8 text-muted-foreground">Carregando avisos...</div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Nenhum aviso publicado</h3>
                                <p className="text-gray-500">Clique em "Novo Aviso" para criar o primeiro comunicado.</p>
                            </div>
                        ) : (
                            announcements.map((announcement) => (
                                <Card key={announcement.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-xl font-bold">{announcement.title}</CardTitle>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-500 hover:text-blue-600"
                                                onClick={() => openEditModal(announcement)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-500 hover:text-red-600"
                                                onClick={() => handleDelete(announcement.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground border-t pt-4 mt-2">
                                        Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* --- Tab: Doubts --- */}
                <TabsContent value="doubts" className="space-y-4">
                    <div className="grid gap-4">
                        {loadingDoubts ? (
                            <div className="text-center py-8 text-muted-foreground">Carregando dúvidas...</div>
                        ) : doubts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">Nenhuma dúvida recebida ainda.</div>
                        ) : (
                            doubts.map((doubt) => (
                                <Card key={doubt.id} className={!doubt.answer ? "border-l-4 border-l-yellow-400" : "border-l-4 border-l-green-500"}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-semibold text-primary">{doubt.student?.full_name || doubt.student?.email}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {new Date(doubt.created_at).toLocaleDateString('pt-BR')} às {new Date(doubt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </CardDescription>
                                            </div>
                                            {!doubt.answer ? (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Respondida</Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <p className="font-medium text-sm text-foreground">{doubt.question}</p>
                                        </div>

                                        {doubt.answer ? (
                                            <div className="flex items-start gap-3 pl-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-700">{doubt.answer}</p>
                                                    <Button
                                                        variant="link"
                                                        className="h-auto p-0 text-xs text-muted-foreground"
                                                        onClick={() => {
                                                            setAnsweringDoubt(doubt)
                                                            setAnswerText(doubt.answer || "")
                                                        }}
                                                    >
                                                        Editar resposta
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setAnsweringDoubt(doubt)
                                                    setAnswerText("")
                                                }}
                                            >
                                                <MessageCircle className="mr-2 h-4 w-4" /> Responder
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal de Criação/Edição de Aviso */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                if (!open) resetForm()
                setIsCreateOpen(open)
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingAnnouncement ? 'Editar Aviso' : 'Criar Novo Aviso'}</DialogTitle>
                        <DialogDescription>
                            {editingAnnouncement ? 'Atualize as informações abaixo.' : 'Escreva a mensagem que deseja enviar para todos os alunos.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveAnnouncement} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Manutenção Programada"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Conteúdo</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Digite sua mensagem aqui..."
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Salvando...' : (editingAnnouncement ? 'Atualizar' : 'Publicar')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Responder Dúvida */}
            <Dialog open={!!answeringDoubt} onOpenChange={(open) => !open && setAnsweringDoubt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Responder Dúvida</DialogTitle>
                        <DialogDescription>
                            Respondendo para: <span className="font-medium text-foreground">{answeringDoubt?.student?.full_name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-muted p-3 rounded text-sm italic">
                            "{answeringDoubt?.question}"
                        </div>
                        <div className="space-y-2">
                            <Label>Sua Resposta</Label>
                            <Textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Digite a resposta..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAnswerDoubt}>
                            <Send className="mr-2 h-4 w-4" /> Enviar Resposta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

