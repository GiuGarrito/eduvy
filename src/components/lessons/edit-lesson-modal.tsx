"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, User, Link as LinkIcon, PlayCircle } from "lucide-react"
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

import { RichTextEditor } from "@/components/ui/editor"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Student {
    id: string
    full_name: string
    email: string
}

interface EditLessonModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    lesson: any // Typed as any for now to be flexible with what's passed, or ideally define strict type
    onSuccess?: () => void
}

export function EditLessonModal({ open, onOpenChange, lesson, onSuccess }: EditLessonModalProps) {
    const [studentId, setStudentId] = useState("")
    const [title, setTitle] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [notes, setNotes] = useState("")
    const [content, setContent] = useState("")
    const [meetLink, setMeetLink] = useState("")
    const [videos, setVideos] = useState<{ title: string, url: string }[]>([])
    const [materials, setMaterials] = useState<{ title: string, url: string }[]>([])
    const [loading, setLoading] = useState(false)

    // Real data state
    const [students, setStudents] = useState<Student[]>([])
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (open && lesson) {
            setStudentId(lesson.student_id || "")
            setTitle(lesson.title || "")
            setDate(lesson.date || "")
            setTime(lesson.time || "")
            setNotes(lesson.notes || "")
            setContent(lesson.content || "")
            setMeetLink(lesson.meet_link || "")
            setVideos(lesson.videos || [])
            setMaterials(lesson.materials || [])

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
    }, [open, lesson, supabase])

    const addVideo = () => {
        setVideos([...videos, { title: "", url: "" }])
    }

    const removeVideo = (index: number) => {
        const newVideos = [...videos]
        newVideos.splice(index, 1)
        setVideos(newVideos)
    }

    const updateVideo = (index: number, field: 'title' | 'url', value: string) => {
        const newVideos = [...videos]
        newVideos[index][field] = value
        setVideos(newVideos)
    }

    const addMaterial = () => {
        setMaterials([...materials, { title: "", url: "" }])
    }

    const removeMaterial = (index: number) => {
        const newMaterials = [...materials]
        newMaterials.splice(index, 1)
        setMaterials(newMaterials)
    }

    const updateMaterial = (index: number, field: 'title' | 'url', value: string) => {
        const newMaterials = [...materials]
        newMaterials[index][field] = value
        setMaterials(newMaterials)
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('lessons')
                .update({
                    student_id: studentId,
                    title,
                    date,
                    time,
                    notes,
                    content,
                    meet_link: meetLink,
                    videos: videos.filter(v => v.url && v.title),
                    materials: materials.filter(m => m.url && m.title)
                })
                .eq('id', lesson.id)

            if (error) throw error

            alert(`Aula atualizada com sucesso!`)
            onOpenChange(false)
            if (onSuccess) onSuccess()
            router.refresh()
        } catch (error: any) {
            alert('Erro ao atualizar aula: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Aula</DialogTitle>
                    <DialogDescription>
                        Atualize os detalhes da aula.
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
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Título da Aula</Label>
                        <Input
                            id="title"
                            placeholder="Ex: Treino de Força, Pilates Solo..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Horário</Label>
                            <div className="relative">
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="meetLink">Link da Aula ao Vivo (Meet/Zoom)</Label>
                        <Input
                            id="meetLink"
                            placeholder="https://meet.google.com/..."
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                        />
                    </div>

                    {/* Videos Section */}
                    <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Vídeos Gravados</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addVideo}>
                                + Adicionar Vídeo
                            </Button>
                        </div>
                        {videos.map((video, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Título do Vídeo"
                                    value={video.title}
                                    onChange={(e) => updateVideo(index, 'title', e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="Link (URL)"
                                    value={video.url}
                                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeVideo(index)}>
                                    <span className="text-red-500">X</span>
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Materials Section */}
                    <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Materiais</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                                + Link
                            </Button>
                        </div>
                        {materials.map((material, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Título"
                                    value={material.title}
                                    onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="URL"
                                    value={material.url}
                                    onChange={(e) => updateMaterial(index, 'url', e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
                                    <span className="text-red-500">X</span>
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content">Conteúdo / Apostila</Label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
