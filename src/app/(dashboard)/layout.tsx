import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationBell } from "@/components/notifications/notification-bell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden">
            {/* Sidebar only visible on desktop */}
            <div className="hidden md:block h-full">
                <AppSidebar />
            </div>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                {/* Top header with notification bell */}
                <header className="flex h-12 items-center justify-end px-4 border-b bg-background shrink-0 gap-2">
                    <NotificationBell />
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-auto bg-secondary/30 space-y-6 pb-20 md:pb-8">
                    {children}
                </div>

                {/* Mobile Navigation */}
                <MobileNav />
            </main>
        </div>
    )
}

