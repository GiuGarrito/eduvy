"use client"

import { OverviewCharts } from "@/components/dashboard/overview-charts"
import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu estúdio e atividades do dia.
          </p>
        </div>
      </div>

      <Separator />

      {/* Widgets Section: Alerts, Calendar, Reminders */}
      <DashboardWidgets />

      <Separator />

      {/* Charts Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Desempenho</h3>
        <OverviewCharts />
      </div>
    </div>
  )
}
