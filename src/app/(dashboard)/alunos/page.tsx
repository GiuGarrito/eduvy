
"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { StudentForm } from "@/components/dashboard/student-form"
import { EditStudentModal } from "@/components/dashboard/edit-student-modal"
import { createClient } from "@/lib/supabase/client"
import { deleteStudentUser } from "@/app/actions/students"

// Modified Type to match what we have/can get
type Student = {
    id: string
    full_name: string
    email: string
    monthly_fee?: number
    due_day?: number
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [open, setOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchStudents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('created_at', { ascending: false })

        if (data) {
            setStudents(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStudents()
    }, [supabase])

    // Refresh list when adding new student
    const handleSuccess = () => {
        setOpen(false)
        fetchStudents()
    }

    const handleDelete = async (student: Student) => {
        if (!confirm(`Tem certeza que deseja excluir o aluno "${student.full_name}"? Esta ação não pode ser desfeita.`)) return
        const result = await deleteStudentUser(student.id)
        if (result.error) {
            alert(result.error)
        } else {
            fetchStudents()
        }
    }

    const filteredStudents = students.filter(student =>
        (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciar Alunos</h2>
                    <p className="text-muted-foreground">Visualize e gerencie seus alunos.</p>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Novo Aluno
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Cadastrar Novo Aluno</SheetTitle>
                            <SheetDescription>
                                Preencha as informações básicas do aluno. Clique em salvar quando terminar.
                            </SheetDescription>
                        </SheetHeader>
                        <StudentForm onSuccess={handleSuccess} />
                    </SheetContent>
                </Sheet>
            </header>

            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar alunos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Carregando alunos...
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhum aluno encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">Ativo</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/alunos/${student.id}`}>
                                                            Ver Histórico
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDelete(student)}
                                                    >
                                                        Excluir Aluno
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {editingStudent && (
                <EditStudentModal
                    open={!!editingStudent}
                    onOpenChange={(open) => !open && setEditingStudent(null)}
                    student={editingStudent}
                    onSuccess={() => {
                        setEditingStudent(null)
                        fetchStudents()
                    }}
                />
            )}
        </div>
    )
}
