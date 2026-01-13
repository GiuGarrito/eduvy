"use client"

import { Home, BookOpen, Wallet, Megaphone, HelpCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function StudentMobileNav() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden font-sans">
            {/* Curved Background Container */}
            <div className="relative bg-primary h-16 w-full flex items-center justify-center gap-20 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">

                {/* Left Side Items */}
                <div className="flex items-center gap-3">
                    <Link href="/portal/aulas" className="flex flex-col items-center gap-1">
                        <BookOpen className={cn("h-6 w-6 transition-colors", isActive('/portal/aulas') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/portal/aulas') ? "text-white" : "text-white/60")}>Aulas</span>
                    </Link>
                    <Link href="/portal/financeiro" className="flex flex-col items-center gap-1">
                        <Wallet className={cn("h-6 w-6 transition-colors", isActive('/portal/financeiro') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/portal/financeiro') ? "text-white" : "text-white/60")}>Financeiro</span>
                    </Link>
                </div>

                {/* Center FAB (Floating Action Button) - Home */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Link href="/portal" className="relative flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg border-4 border-background transition-transform hover:scale-105 active:scale-95">
                        <Home className="h-6 w-6 text-primary" />
                    </Link>
                </div>

                {/* Right Side Items */}
                <div className="flex items-center gap-3">
                    <Link href="/portal/duvidas" className="flex flex-col items-center gap-1">
                        <HelpCircle className={cn("h-6 w-6 transition-colors", isActive('/portal/duvidas') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/portal/duvidas') ? "text-white" : "text-white/60")}>Dúvidas</span>
                    </Link>
                    <Link href="/portal/avisos" className="flex flex-col items-center gap-1">
                        <Megaphone className={cn("h-6 w-6 transition-colors", isActive('/portal/avisos') ? "text-white fill-white/20" : "text-white/60")} />
                        <span className={cn("text-[10px] font-medium", isActive('/portal/avisos') ? "text-white" : "text-white/60")}>Avisos</span>
                    </Link>
                </div>

            </div>
        </div>
    )
}
