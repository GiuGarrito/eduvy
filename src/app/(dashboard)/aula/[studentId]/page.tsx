"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TiptapEditor } from "@/components/editor/tiptap-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function LessonPage({ params }: { params: { studentId: string } }) {
    // Mock Data - In real app, fetch based on studentId and today's date
    const studentName = "João Silva" // Mock
    const date = new Date().toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' })

    const [apostillaContent, setApostillaContent] = useState("<p>Hoje trabalhamos...</p>")
    const [privateNotes, setPrivateNotes] = useState("")

    const handleSave = () => {
        console.log("Saving...", { apostila: apostillaContent, notes: privateNotes })
        // Simulate save
        alert("Conteúdo salvo com sucesso!")
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{studentName}</h2>
                        <p className="text-muted-foreground capitalize">{date}</p>
                    </div>
                </div>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" /> Finalizar Aula
                </Button>
            </div>

            <Tabs defaultValue="apostilla" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="apostilla">Apostilla (Aluno)</TabsTrigger>
                    <TabsTrigger value="obs">Observações (Privado)</TabsTrigger>
                </TabsList>

                <TabsContent value="apostilla" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-md bg-blue-50 text-blue-800 text-sm mb-4">
                        <h4 className="font-semibold mb-1">O que é a Apostilla?</h4>
                        <p>Este conteúdo ficará visível para o aluno no futuro. Registre os exercícios, cargas e progressos de hoje.</p>
                    </div>
                    <TiptapEditor
                        value={apostillaContent}
                        onChange={setApostillaContent}
                        placeholder="Descreva o treino de hoje..."
                    />
                </TabsContent>

                <TabsContent value="obs" className="space-y-4 mt-4">
                    <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800 text-sm mb-4">
                        <h4 className="font-semibold mb-1">Privado</h4>
                        <p>Anotações exclusivas para você. O aluno nunca terá acesso a isso.</p>
                    </div>
                    <Textarea
                        value={privateNotes}
                        onChange={(e) => setPrivateNotes(e.target.value)}
                        placeholder="Ex: Aluno reclamou de dor no ombro..."
                        className="min-h-[300px]"
                    />
                </TabsContent>

            </Tabs>
        </div>
    )
}
