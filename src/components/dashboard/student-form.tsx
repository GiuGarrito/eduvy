"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { createStudentUser } from "@/app/actions/students"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().optional(),
    password: z.string().optional(), // New field
    phone: z.string().min(10, {
        message: "Telefone inválido.",
    }),
    frequency: z.enum(["1x", "2x", "3x"]),
    notes: z.string().optional(),
    monthlyFee: z.string().min(1, "Campo obrigatório"),
    dueDay: z.string().min(1, "Dia de vencimento obrigatório"),
    lessonsPerMonth: z.string().min(1, "Campo obrigatório"),
    costPerLesson: z.string().optional(),
    autoBilling: z.boolean(),
})

export function StudentForm({ onSuccess }: { onSuccess?: () => void }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            notes: "",
            monthlyFee: "0",
            dueDay: "5",
            lessonsPerMonth: "8",
            costPerLesson: "0",
            autoBilling: false,
            frequency: "2x",
        },
    })

    // Watch for changes to calculate cost per lesson
    const monthlyFee = form.watch("monthlyFee")
    const lessonsPerMonth = form.watch("lessonsPerMonth")

    useEffect(() => {
        const fee = parseFloat(monthlyFee) || 0
        const lessons = parseFloat(lessonsPerMonth) || 0
        if (fee > 0 && lessons > 0) {
            const cost = fee / lessons
            form.setValue("costPerLesson", cost.toFixed(2))
        }
    }, [monthlyFee, lessonsPerMonth, form])


    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)

        // Create FormData to pass to server action
        const formData = new FormData()
        formData.append("name", values.name)
        if (values.email) formData.append("email", values.email)
        if (values.password) formData.append("password", values.password) // Append password
        formData.append("monthly_fee", values.monthlyFee)
        formData.append("due_day", values.dueDay)

        // Calling server action
        const result = await createStudentUser(formData)

        if (result.error) {
            alert(result.error)
        } else {
            alert(result.message) // Shows the temporary password
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: João da Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (Login)</FormLabel>
                            <FormControl>
                                <Input placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha Provisória (Opcional)</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Padrão: mudar123" {...field} />
                            </FormControl>
                            <FormDescription>Deixe em branco para usar a padrão.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frequência</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1x">1x por semana</SelectItem>
                                        <SelectItem value="2x">2x por semana</SelectItem>
                                        <SelectItem value="3x">3x por semana</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>WhatsApp / Telefone</FormLabel>
                                <FormControl>
                                    <Input placeholder="(00) 00000-0000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="border p-4 rounded-md space-y-4 bg-gray-50/50">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Configuração Financeira</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="monthlyFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensalidade (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dia Vencimento</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Dia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[5, 10, 15, 20, 25, 30].map((day) => (
                                                <SelectItem key={day} value={day.toString()}>
                                                    Dia {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="lessonsPerMonth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Aulas/Mês (Est.)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="8" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="costPerLesson"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor por Aula (Calculado)</FormLabel>
                                <FormControl>
                                    <Input type="number" readOnly className="bg-gray-100" {...field} />
                                </FormControl>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Baseado na mensalidade e qtd. de aulas.
                                </p>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="autoBilling"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-white shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Cobrança Automática</FormLabel>
                                    <FormDescription>
                                        Automatizar envio de cobrança (Futuro)
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observações Iniciais</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Objetivos, lesões, restrições..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="w-full md:w-auto">Salvar Aluno</Button>
                </div>
            </form>
        </Form >
    )
}
