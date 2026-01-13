
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import { createClient } from "@/lib/supabase/server"

import { StudentMobileNav } from "@/components/portal/student-mobile-nav"

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userData = { name: 'Aluno', email: '' }

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        userData = {
            name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
            email: user.email || ''
        }
    }

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden">
            {/* Sidebar only visible on desktop */}
            <div className="hidden md:block h-full">
                <PortalSidebar user={userData} />
            </div>

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:px-6 shadow-sm z-10 shrink-0 md:flex hidden">
                    <h1 className="font-semibold text-sm md:text-base text-primary">Portal do Aluno</h1>
                </header>
                <div className="flex-1 p-4 md:p-8 overflow-auto bg-secondary/30 pb-20 md:pb-8">
                    <div className="mx-auto max-w-4xl w-full">
                        {children}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <StudentMobileNav />
            </main>
        </div>
    )
}
