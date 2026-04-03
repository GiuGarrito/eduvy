
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, FileText, Plus, User, DollarSign, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPaymentModal } from "@/components/finance/add-payment-modal"
import { EditStudentModal } from "@/components/dashboard/edit-student-modal"
import { EditLessonModal } from "@/components/lessons/edit-lesson-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { deleteStudentUser } from "@/app/actions/students"
import { useRouter } from "next/navigation"

interface StudentProfile {
    id: string
    full_name: string
    email: string
    role: string
    created_at: string
    monthly_fee?: number
    due_day?: number
    // We can add phone/frequency if we add them to profile later
}

interface Lesson {
    id: string
    title: string
    date: string
    status: string
}

interface Payment {
    id: string
    status: string
    amount: number
}

export default function StudentProfilePage({ params }: { params: { id: string } }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [student, setStudent] = useState<StudentProfile | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [editingLesson, setEditingLesson] = useState<any>(null)

    const supabase = createClient()
    const router = useRouter()
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null)

    useEffect(() => {
        const unwrap = async () => {
            const resolvedParams = await params
            setUnwrappedParams(resolvedParams)
        }
        unwrap()
    }, [params])

    const fetchStudentData = async () => {
        if (!unwrappedParams?.id) return

        setLoading(true)
        try {
            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', unwrappedParams.id)
                .single()

            if (profileError) throw profileError
            setStudent(profileData)

            // 2. Fetch Lessons
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('student_id', unwrappedParams.id)
                .order('date', { ascending: false })

            if (lessonsError) throw lessonsError
            setLessons(lessonsData || [])

            // 3. Fetch Payments to determine status
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('student_id', unwrappedParams.id)

            if (paymentsData) setPayments(paymentsData)

        } catch (error) {
            console.error("Error fetching student details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (unwrappedParams?.id) {
            fetchStudentData()
        }
    }, [supabase, unwrappedParams])

    const handleDeleteStudent = async () => {
        if (!student) return
        if (!confirm(`Tem certeza que deseja excluir o aluno "${student.full_name}"? Esta ação não pode ser desfeita.`)) return
        const result = await deleteStudentUser(student.id)
        if (result.error) {
            alert(result.error)
        } else {
            router.push('/alunos')
        }
    }

    // Calculate Financial Status
    const overduePayments = payments.filter((p: Payment) => p.status === 'overdue')
    const pendingPayments = payments.filter((p: Payment) => p.status === 'pending')
    const isOverdue = overduePayments.length > 0

    if (loading) {
        return <div className="p-8 text-center">Carregando perfil do aluno...</div>
    }

    if (!student) {
        return <div className="p-8 text-center">Aluno não encontrado.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/alunos">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{student.full_name}</h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <User className="h-3 w-3" /> Aluno desde {new Date(student.created_at).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteStudent}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </Button>
            </div>

            <EditStudentModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                student={student}
                onSuccess={fetchStudentData}
            />

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Info & Financial */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Contato</label>
                                {/* <div className="font-medium text-sm">(11) 99999-9999</div> */}
                                <div className="text-sm text-gray-700">{student.email}</div>
                            </div>
                            {/* <Separator />
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Frequência</label>
                                <div className="font-medium">2x por semana</div>
                            </div> */}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Mensalidade Atual</label>
                                <div className="font-medium text-lg">
                                    {student.monthly_fee
                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(student.monthly_fee)
                                        : 'Não definida'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {isOverdue ? (
                                        <Badge variant="destructive">
                                            {overduePayments.length} Pagamento(s) Atrasado(s)
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                            Em dia
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => setIsPaymentModalOpen(true)}>
                                <DollarSign className="mr-2 h-4 w-4" /> Registrar Pagamento
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Histórico de Aulas</CardTitle>
                                <CardDescription>Gerencie o conteúdo das aulas deste aluno.</CardDescription>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/aula/${student.id}`}>
                                    <Plus className="mr-2 h-4 w-4" /> Nova Aula
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lessons.map((lesson: Lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {new Date(lesson.date).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={lesson.status === 'completed' ? 'secondary' : 'outline'}>
                                                {lesson.status === 'completed' ? 'Concluída' : 'Agendada'}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
                                                Editar
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/aulas`}>
                                                    Ver
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {lessons.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Nenhuma aula registrada para este aluno.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AddPaymentModal
                open={isPaymentModalOpen}
                onOpenChange={(open) => {
                    setIsPaymentModalOpen(open)
                    if (!open) fetchStudentData() // Refresh payments when modal closes
                }}
                defaultStudentId={student.id}
            />

            <EditLessonModal
                open={!!editingLesson}
                onOpenChange={(open) => !open && setEditingLesson(null)}
                lesson={editingLesson}
                onSuccess={fetchStudentData}
            />
        </div>
    )
}
