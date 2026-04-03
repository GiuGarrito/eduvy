
"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createStudentUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const monthly_fee = formData.get("monthly_fee") as string
    const due_day = formData.get("due_day") as string
    const password = formData.get("password") as string

    if (!email || !name) {
        return { error: "Nome e Email são obrigatórios para criar o acesso." }
    }

    // Admin Client with Service Role Key to bypass RLS and Auth restrictions
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    // We don't need to set cookies for the admin client in this context
                },
            },
        }
    )

    // 1. Create User in Supabase Auth
    // Use provided password or default
    const finalPassword = password || "mudar123"

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true, // Auto confirm
        user_metadata: {
            full_name: name,
            role: 'student', // Force role to student
            monthly_fee: monthly_fee,
            due_day: due_day
        }
    })

    if (authError) {
        console.error("Auth Create Error:", authError)
        return { error: `Erro ao criar usuário: ${authError.message}` }
    }

    // 2. Return success
    return {
        success: true,
        userId: authData.user.id,
        message: `Aluno criado! Email: ${email}, Senha: ${finalPassword}`
    }
}

export async function deleteStudentUser(userId: string) {
    if (!userId) {
        return { error: "ID do usuário é obrigatório." }
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { },
            },
        }
    )

    // Delete related records first to avoid FK constraint errors
    await supabase.from('payments').delete().eq('student_id', userId)
    await supabase.from('lessons').delete().eq('student_id', userId)
    await supabase.from('announcements').delete().eq('student_id', userId)
    await supabase.from('doubts').delete().eq('student_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error("Delete User Error:", error)
        return { error: `Erro ao excluir aluno: ${error.message}` }
    }

    return { success: true, message: "Aluno excluído com sucesso!" }
}

export async function updateStudentPassword(userId: string, newPassword: string) {
    if (!userId || !newPassword) {
        return { error: "ID do usuário e nova senha são obrigatórios." }
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { },
            },
        }
    )

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
    })

    if (error) {
        console.error("Update Password Error:", error)
        return { error: `Erro ao atualizar senha: ${error.message}` }
    }

    return { success: true, message: "Senha atualizada com sucesso!" }
}
