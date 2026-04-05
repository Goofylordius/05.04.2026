import Link from "next/link";

import { ForecastMomentumChart } from "@/components/dashboard/charts";
import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type DealsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const session = await requireSessionContext("crm.view");
  const canManage = session.permissions.includes("crm.manage");
  const [dealRows, customerRows, query] = await Promise.all([
    loadDeals(),
    loadCustomers(),
    searchParams,
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
    valueCents: dealRows
      .filter((deal) => deal.stage === stage)
      .reduce((sum, deal) => sum + deal.valueCents, 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Pipeline-Board fuer Vertrieb mit Stage-Volumen, Forecast und direktem Drill-down in jede Opportunity."
        eyebrow="Pipeline"
        title="Deals"
        actions={
          canManage ? (
            <Button render={<Link href="/crm/deals/new" />}>Neuer Deal</Button>
          ) : undefined
        }
      />

      <StatusBanner error={query.error} message={query.message} />

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
              <p className="text-muted-foreground text-xs">
                {formatCurrency(entry.valueCents)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Forecast Momentum</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastMomentumChart data={forecastCurve} />
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Stage Board</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {stageCounters.map((entry) => (
              <div
                className="border-border/70 bg-background/25 rounded-2xl border p-3"
                key={entry.stage}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-foreground font-medium capitalize">
                    {entry.stage}
                  </p>
                  <Badge variant="outline">{entry.total}</Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Volumen {formatCurrency(entry.valueCents)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="surface-panel border-border/70 border">
        <CardHeader>
          <CardTitle>Opportunity Register</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            columns={[
              {
                key: "title",
                header: "Deal",
                cell: (row) => (
                  <div>
                    <Link
                      className="text-foreground font-medium hover:underline"
                      href={`/crm/deals/${row.id}`}
                    >
                      {row.title}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {customerMap.get(row.customerId)?.companyName ??
                        "Unbekannt"}
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
            getRowKey={(row) => row.id}
            rows={dealRows}
          />
        </CardContent>
      </Card>
    </div>
  );
}
