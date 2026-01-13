import { Loader2 } from "lucide-react"

export default function PortalLoading() {
    return (
        <div className="h-full w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-primary p-8">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Carregando conteúdo...</p>
        </div>
    )
}
