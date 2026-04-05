import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  DealMixChart,
  RevenueForecastChart,
  SyncObservabilityChart,
} from "@/components/dashboard/charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RingMetric } from "@/components/dashboard/ring-metric";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionContext } from "@/lib/auth/session";
import {
  loadAppointments,
  loadAuditLogs,
  loadDashboardMetrics,
  loadDeals,
} from "@/lib/data";

const revenueSeries = [
  { month: "Jan", revenue: 18000, forecast: 21000 },
  { month: "Feb", revenue: 22000, forecast: 24000 },
  { month: "Mar", revenue: 28500, forecast: 27500 },
  { month: "Apr", revenue: 24000, forecast: 32000 },
  { month: "Mai", revenue: 0, forecast: 36000 },
  { month: "Jun", revenue: 0, forecast: 38500 },
];

const syncSeries = [
  { label: "Mo", success: 98, pending: 3 },
  { label: "Di", success: 99, pending: 2 },
  { label: "Mi", success: 96, pending: 6 },
  { label: "Do", success: 99, pending: 1 },
  { label: "Fr", success: 98, pending: 2 },
];

export default async function DashboardPage() {
  await requireSessionContext("dashboard.view");
  const [metrics, deals, appointments, auditEntries] = await Promise.all([
    loadDashboardMetrics(),
    loadDeals(),
    loadAppointments(),
    loadAuditLogs(),
  ]);

  const stageSeries = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ].map((stage) => ({
    stage,
    value: deals.filter((deal) => deal.stage === stage).length,
  }));

  const utilization = Math.min(
    92,
    Math.max(45, Math.round((appointments.length / 7) * 24)),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        description="Verdichtete Sicht auf Vertriebspipeline, Dokumentenlage, Kalender-Synchronisation und Betriebsqualitaet."
        eyebrow="Enterprise Dashboard"
        title="Leitstand"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <RingMetric
          helper="Ausgelastete Vertriebskapazitaet diese Woche"
          label="Team Utilization"
          value={utilization}
        />

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Umsatz vs. Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueForecastChart data={revenueSeries} />
          </CardContent>
        </Card>

        <ActivityFeed entries={auditEntries} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Sync Observability</CardTitle>
          </CardHeader>
          <CardContent>
            <SyncObservabilityChart data={syncSeries} />
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Deal Mix</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <DealMixChart data={stageSeries} />
            <div className="grid gap-2">
              {stageSeries.map((stage) => (
                <div
                  className="border-border/70 bg-background/25 flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                  key={stage.stage}
                >
                  <span className="text-muted-foreground capitalize">
                    {stage.stage}
                  </span>
                  <span className="text-foreground font-medium">
                    {stage.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
