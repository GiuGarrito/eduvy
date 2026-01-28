"use client"

import { Home, Users, BookOpen, DollarSign, Megaphone, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden font-sans">
            {/* Curved Background Container */}
            <div className="relative bg-primary h-16 w-full flex items-center justify-center gap-20 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">

                {/* Left Side Items */}
                <div className="flex items-center gap-3 pl-2">
                    <Link href="/alunos" className="flex flex-col items-center gap-1">
                        <Users className={cn("h-6 w-6 transition-colors", isActive('/alunos') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/alunos') ? "text-white" : "text-white/60")}>Alunos</span>
                    </Link>
                    <Link href="/aulas" className="flex flex-col items-center gap-1">
                        <BookOpen className={cn("h-6 w-6 transition-colors", isActive('/aulas') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/aulas') ? "text-white" : "text-white/60")}>Aulas</span>
                    </Link>
                </div>

                {/* Center FAB (Floating Action Button) - Dashboard */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Link href="/" className="relative flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg border-4 border-background transition-transform hover:scale-105 active:scale-95">
                        <Home className="h-6 w-6 text-primary" />
                    </Link>
                </div>

                {/* Right Side Items */}
                <div className="flex items-center gap-3 pr-2">
                    <Link href="/financeiro" className="flex flex-col items-center gap-1">
                        <DollarSign className={cn("h-6 w-6 transition-colors", isActive('/financeiro') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/financeiro') ? "text-white" : "text-white/60")}>Financeiro</span>
                    </Link>
                    <Link href="/agenda" className="flex flex-col items-center gap-1">
                        <Plus className={cn("h-6 w-6 transition-colors", isActive('/agenda') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/agenda') ? "text-white" : "text-white/60")}>Agenda</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}
