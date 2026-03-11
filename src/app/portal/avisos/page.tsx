"use client"

import { useState, useEffect } from "react"
import { Megaphone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type Announcement = {
    id: string
    title: string
    content: string
    student_id: string | null
    created_at: string
}

export default function StudentAvisosPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching announcements:', error)
            } else {
                setAnnouncements(data || [])
            }
            setLoading(false)
        }

        fetchAnnouncements()
    }, [])

    return (
        <div className="container py-6 space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Megaphone className="h-8 w-8 text-primary" />
                    Mural de Avisos
                </h1>
                <p className="text-muted-foreground mt-2">
                    Fique por dentro das novidades e comunicados importantes.
                </p>
            </header>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando avisos...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum aviso no momento</h3>
                        <p className="text-gray-500">Tudo tranquilo por aqui! Volte mais tarde.</p>
                    </div>
                ) : (
                    announcements.map((announcement: Announcement) => (
                        <Card key={announcement.id} className="border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl text-primary">{announcement.title}</CardTitle>
                                    {announcement.student_id && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                            <User className="h-3 w-3" /> Pessoal
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {announcement.content}
                                </p>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground border-t bg-gray-50/50 rounded-b-lg">
                                Publicado em {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
