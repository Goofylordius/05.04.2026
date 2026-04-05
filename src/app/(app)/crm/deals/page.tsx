import { ForecastMomentumChart } from "@/components/dashboard/charts";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCustomers, loadDeals } from "@/lib/data";
import { formatCurrency, formatPercentage } from "@/lib/format";

const forecastCurve = [
  { week: "KW14", pipeline: 18 },
  { week: "KW15", pipeline: 24 },
  { week: "KW16", pipeline: 31 },
  { week: "KW17", pipeline: 29 },
  { week: "KW18", pipeline: 36 },
  { week: "KW19", pipeline: 41 },
];

export default async function DealsPage() {
  await requireSessionContext("crm.view");
  const [dealRows, customerRows] = await Promise.all([
    loadDeals(),
    loadCustomers(),
  ]);
  const customerMap = new Map(
    customerRows.map((customer) => [customer.id, customer]),
  );

  const stageCounters = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ].map((stage) => ({
    stage,
    total: dealRows.filter((deal) => deal.stage === stage).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Opportunity-Management mit Forecast, Stage-Performance und hoher Datendichte fuer Vertriebsteams."
        eyebrow="Pipeline"
        title="Deals"
      />

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stageCounters.map((entry) => (
          <Card
            className="surface-panel border-border/70 border"
            key={entry.stage}
          >
            <CardContent className="space-y-2 py-6">
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                {entry.stage}
              </p>
              <p className="text-foreground text-3xl font-semibold">
                {entry.total}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="surface-panel border-border/70 border">
        <CardHeader>
          <CardTitle>Forecast Momentum</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastMomentumChart data={forecastCurve} />
        </CardContent>
      </Card>

      <DataGrid
        columns={[
          {
            key: "title",
            header: "Deal",
            cell: (row) => (
              <div>
                <div className="text-foreground font-medium">{row.title}</div>
                <div className="text-muted-foreground text-xs">
                  {customerMap.get(row.customerId)?.companyName ?? "Unbekannt"}
                </div>
              </div>
            ),
          },
          {
            key: "value",
            header: "Wert",
            cell: (row) => formatCurrency(row.valueCents),
          },
          {
            key: "stage",
            header: "Stage",
            cell: (row) => (
              <span className="text-muted-foreground capitalize">
                {row.stage}
              </span>
            ),
          },
          {
            key: "probability",
            header: "Win %",
            cell: (row) => formatPercentage(row.probability),
          },
          {
            key: "close",
            header: "Close",
            cell: (row) => row.expectedCloseDate,
          },
        ]}
        emptyState="Keine Opportunities gefunden."
        rows={dealRows}
      />
    </div>
  );
}
