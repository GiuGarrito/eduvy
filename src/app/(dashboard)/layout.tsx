import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'student') {
            redirect('/portal')
        }
    }

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <div className="flex-1 p-8 overflow-auto bg-secondary/30 space-y-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

