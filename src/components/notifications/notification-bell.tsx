"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type Notification = {
    id: string
    title: string
    message: string | null
    type: string
    read: boolean
    created_at: string
}

const typeIcon: Record<string, string> = {
    booking: "📅",
    answer: "💬",
    payment: "💰",
    info: "ℹ️",
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const supabase = createClient()

    const fetchNotifications = useCallback(async () => {
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20)

        if (data) setNotifications(data)
    }, [supabase])

    useEffect(() => {
        fetchNotifications()

        // Realtime: escuta novas notificações
        const channel = supabase
            .channel("notifications_channel")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                () => fetchNotifications()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchNotifications, supabase])

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAllRead = async () => {
        const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
        if (unreadIds.length === 0) return

        await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", unreadIds)

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && unreadCount > 0) {
            markAllRead()
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">Notificações</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">{unreadCount} nova(s)</span>
                    )}
                </div>
                <ScrollArea className="h-[320px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
                            <Bell className="h-6 w-6 opacity-30" />
                            Nenhuma notificação
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 text-sm transition-colors ${!n.read ? "bg-blue-50/60" : ""}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-base mt-0.5">{typeIcon[n.type] || "🔔"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 leading-snug">{n.title}</p>
                                            {n.message && (
                                                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{n.message}</p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
