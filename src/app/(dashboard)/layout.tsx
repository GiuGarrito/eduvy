// Sidebar imports removed as they are not used here and caused build errors
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"


import { MobileNav } from "@/components/mobile-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // ... verification logic ...

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden">
            {/* Sidebar only visible on desktop */}
            <div className="hidden md:block h-full">
                <AppSidebar />
            </div>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                {/* Add padding bottom on mobile to account for navbar */}
                <div className="flex-1 p-4 md:p-8 overflow-auto bg-secondary/30 space-y-6 pb-20 md:pb-8">
                    {children}
                </div>

                {/* Mobile Navigation */}
                <MobileNav />
            </main>
        </div>
    )
}

