import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background text-primary">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
    )
}
