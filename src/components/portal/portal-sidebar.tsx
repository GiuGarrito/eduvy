"use client"

import React, { useState } from "react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import {
    Home,
    BookOpen,
    Wallet,
    HelpCircle,
    LogOut,
    Megaphone,
    User,
    CalendarPlus
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PortalSidebarProps {
    user?: {
        name?: string
        email?: string
    }
}

export function PortalSidebar({ user }: PortalSidebarProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const items = [
        {
            label: "Home",
            href: "/portal",
            icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Agendar Aula",
            href: "/portal/agendar",
            icon: <CalendarPlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Minhas Aulas",
            href: "/portal/aulas",
            icon: <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Financeiro",
            href: "/portal/financeiro",
            icon: <Wallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Dúvidas",
            href: "/portal/duvidas",
            icon: <HelpCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Avisos",
            href: "/portal/avisos",
            icon: <Megaphone className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const displayName = user?.name || user?.email || 'Aluno'

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {items.map((item, idx) => (
                            <SidebarLink key={idx} link={item} />
                        ))}
                    </div>
                </div>
                <div>
                    <SidebarLink
                        link={{
                            label: displayName,
                            href: "#",
                            icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />, // User Icon
                        }}
                    />
                    <div
                        onClick={handleLogout}
                        className="cursor-pointer"
                    >
                        <SidebarLink
                            link={{
                                label: "Sair",
                                href: "#",
                                icon: <LogOut className="text-red-500 h-5 w-5 flex-shrink-0" />,
                            }}
                        />
                    </div>
                </div>
            </SidebarBody>
        </Sidebar>
    )
}

export const Logo = () => {
    return (
        <Link
            href="/portal"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-black dark:text-white whitespace-pre"
            >
                Eduvy Portal
            </motion.span>
        </Link>
    )
}

export const LogoIcon = () => {
    return (
        <Link
            href="/portal"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    )
}
