
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Video, PlayCircle, ExternalLink, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface VideoItem {
    title: string
    url: string
}

interface Lesson {
    id: string
    title: string
    date: string
    content: string
    meet_link?: string
    videos?: VideoItem[]
    materials?: VideoItem[] // Reuse VideoItem as it has title & url
}


import { useParams, useRouter } from "next/navigation"

export default function StudentClassroomPage() {
    const params = useParams()
    const id = params.id as string
    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchLesson = async () => {
            const { data, error } = await supabase

                .from('lessons')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setLesson(data)
                // Video selection is now manual via the 'Gravações' button logic
                // if (data.videos && data.videos.length > 0) {
                //     setSelectedVideo(data.videos[0])
                // }
            }
            setLoading(false)
        }


        fetchLesson()
    }, [id, supabase])

    const getEmbedUrl = (url: string) => {
        // Simple helper to convert youtube links to embed
        // Supports: youtube.com/watch?v=ID, youtu.be/ID
        try {
            let videoId = ""
            if (url.includes('youtube.com/watch')) {
                videoId = url.split('v=')[1]?.split('&')[0]
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]
            }

            if (videoId) return `https://www.youtube.com/embed/${videoId}`

            // If it's already an embed link or other source, try returning as is
            return url
        } catch (e) {
            return url
        }
    }

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-primary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground animate-pulse">Carregando aula...</p>
        </div>
    )
    if (!lesson) return <div className="p-8 text-center text-white">Aula não encontrada.</div>

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Top Header - Lesson Info & Actions */}
            <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <Button variant="ghost" size="icon" asChild className="shrink-0 text-muted-foreground hover:text-primary">
                            <Link href="/portal">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>

                        <div className="flex flex-col overflow-hidden">
                            <h1 className="font-bold text-lg md:text-xl leading-none truncate text-primary">{lesson.title}</h1>
                            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(lesson.date).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Live Class Button */}
                        {lesson.meet_link && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse shadow-md hidden md:flex"
                                onClick={() => window.open(lesson.meet_link, '_blank')}
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Entrar na Aula
                            </Button>
                        )}

                        {/* Recordings Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 relative">
                                    <PlayCircle className="h-4 w-4 text-primary" />
                                    <span className="hidden md:inline">Gravações</span>
                                    {lesson.videos && lesson.videos.length > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] pointer-events-none">
                                            {lesson.videos.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 p-0">
                                <div className="p-3 border-b bg-muted/50 font-semibold text-sm">
                                    Conteúdo Gravado
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                    {lesson.videos && lesson.videos.length > 0 ? (
                                        lesson.videos.map((video, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedVideo(video)
                                                    // Close popover logic would require controlled state, keeping generic for now or user verify
                                                }}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors text-sm",
                                                    selectedVideo === video
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'hover:bg-muted text-muted-foreground'
                                                )}
                                            >
                                                <PlayCircle className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{video.title || `Vídeo ${index + 1}`}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            Nenhum vídeo disponível.
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Materials Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 relative">
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                    <span className="hidden md:inline">Materiais</span>
                                    {lesson.materials && lesson.materials.length > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] pointer-events-none">
                                            {lesson.materials.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 p-0">
                                <div className="p-3 border-b bg-muted/50 font-semibold text-sm">
                                    Materiais Extras
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                    {lesson.materials && lesson.materials.length > 0 ? (
                                        lesson.materials.map((material, index) => (
                                            <a
                                                key={index}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {material.title || `Link ${index + 1}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            Nenhum material extra.
                                        </p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 bg-secondary/20 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Mobile Live Button (Visible only on mobile) */}
                    {lesson.meet_link && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse shadow-md md:hidden mb-4"
                            onClick={() => window.open(lesson.meet_link, '_blank')}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Entrar na Aula ao Vivo
                        </Button>
                    )}

                    {/* Video Player */}
                    {selectedVideo && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-border/50 ring-1 ring-white/10">
                            <iframe
                                src={getEmbedUrl(selectedVideo.url)}
                                className="w-full h-full"
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}

                    {/* Rich Text Content */}
                    <div className="bg-card w-full rounded-2xl p-6 md:p-10 shadow-sm border border-border/50">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <div className="h-10 w-1.5 bg-primary rounded-full"></div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                Material de Apostila
                            </h2>
                        </div>


                        {lesson.content ? (
                            <div
                                className="prose prose-lg prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                            />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed">
                                <p className="italic">
                                    Nenhuma apostila disponível para esta aula.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
