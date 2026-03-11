"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Save, Wallet } from "lucide-react"

export default function SettingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [pixKey, setPixKey] = useState("")
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                setUserId(user.id)
                // Fetch current pix key from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('pix_key')
                    .eq('id', user.id)
                    .single()
                
                if (profile && profile.pix_key) {
                    setPixKey(profile.pix_key)
                }
            }
            setLoading(false)
        }
        
        fetchUserData()
    }, [supabase])

    const handleSavePix = async () => {
        if (!userId) return
        
        setSaving(true)
        const { error } = await supabase
            .from('profiles')
            .update({ pix_key: pixKey })
            .eq('id', userId)

        if (error) {
            alert("Erro ao salvar chave PIX. Tente novamente.")
        } else {
            alert("Chave PIX atualizada com sucesso! Seus alunos agora verão esta chave na hora de pagar.")
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie suas preferências e dados de recebimento.
                </p>
            </div>

            <Card className="max-w-xl">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <CardTitle>Recebimentos por PIX</CardTitle>
                    </div>
                    <CardDescription>
                        Esta chave será exibida automaticamente no portal dos alunos para facilitar o pagamento das mensalidades.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pix-key">Sua Chave PIX (CPF, Email, Telefone ou Aleatória)</Label>
                        <Input 
                            id="pix-key" 
                            placeholder="Ex: 123.456.789-00 ou professor@email.com" 
                            value={pixKey}
                            onChange={(e) => setPixKey(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleSavePix} 
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Chave PIX
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
