import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCustomers, loadDeals, loadDocuments } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

type CustomersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const session = await requireSessionContext("crm.view");
  const canManage = session.permissions.includes("crm.manage");
  const [customerRows, dealRows, documentRows, query] = await Promise.all([
    loadCustomers(),
    loadDeals(),
    loadDocuments(),
    searchParams,
  ]);

  const accountRows = customerRows
    .map((customer) => {
      const customerDeals = dealRows.filter(
        (deal) => deal.customerId === customer.id,
      );
      const openDocuments = documentRows.filter(
        (document) =>
          document.customerId === customer.id &&
          document.status !== "paid" &&
          document.status !== "cancelled",
      );

      return {
        ...customer,
        pipelineCents: customerDeals.reduce(
          (sum, deal) => sum + deal.valueCents,
          0,
        ),
        activeDeals: customerDeals.filter(
          (deal) => deal.stage !== "won" && deal.stage !== "lost",
        ).length,
        openDocuments: openDocuments.length,
      };
    })
    .sort((left, right) => right.pipelineCents - left.pipelineCents);

  const averageHealth = Math.round(
    accountRows.reduce((sum, customer) => sum + customer.healthScore, 0) /
      Math.max(accountRows.length, 1),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        description="Operative Account-Ansicht mit Pipeline, offenen Dokumenten und direktem Drill-down in Kundenakten."
        eyebrow="CRM"
        title="Kunden"
        actions={
          canManage ? (
            <Button render={<Link href="/crm/customers/new" />}>
              Neuer Kunde
            </Button>
          ) : undefined
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Kundenbestand
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {accountRows.length}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Durchschnitt Health
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {averageHealth}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Aktive Deals
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {
                dealRows.filter(
                  (deal) => deal.stage !== "won" && deal.stage !== "lost",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Offene Dokumente
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {
                documentRows.filter(
                  (document) =>
                    document.status !== "paid" &&
                    document.status !== "cancelled",
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Kundenbestand</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={[
                {
                  key: "company",
                  header: "Konto",
                  cell: (row) => (
                    <div>
                      <Link
                        className="text-foreground font-medium hover:underline"
                        href={`/crm/customers/${row.id}`}
                      >
                        {row.companyName}
                      </Link>
                      <div className="text-muted-foreground text-xs">
                        {row.industry}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "mail",
                  header: "Kontakt",
                  cell: (row) => (
                    <div className="text-muted-foreground text-sm">
                      {row.email}
                      <div className="text-xs">{row.phone}</div>
                    </div>
                  ),
                },
                {
                  key: "pipeline",
                  header: "Pipeline",
                  cell: (row) => formatCurrency(row.pipelineCents),
                },
                {
                  key: "open",
                  header: "Open",
                  className: "text-right",
                  cell: (row) => (
                    <span className="text-foreground font-medium">
                      {row.activeDeals} / {row.openDocuments}
                    </span>
                  ),
                },
                {
                  key: "health",
                  header: "Health",
                  className: "text-right",
                  cell: (row) => (
                    <Badge
                      className="border-border/80 bg-background/60 text-foreground"
                      variant="outline"
                    >
                      {row.healthScore}
                    </Badge>
                  ),
                },
              ]}
              emptyState="Keine Kunden gefunden."
              getRowKey={(row) => row.id}
              rows={accountRows}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Key Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountRows.slice(0, 4).map((customer) => (
                <div
                  className="border-border/70 bg-background/25 rounded-2xl border p-3"
                  key={customer.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        className="text-foreground font-medium hover:underline"
                        href={`/crm/customers/${customer.id}`}
                      >
                        {customer.companyName}
                      </Link>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {customer.industry}
                      </div>
                    </div>
                    <Badge variant="outline">{customer.healthScore}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">
                        Pipeline
                      </p>
                      <p className="text-foreground mt-1 font-medium">
                        {formatCurrency(customer.pipelineCents)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">
                        Dokumente
                      </p>
                      <p className="text-foreground mt-1 font-medium">
                        {customer.openDocuments}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Arbeitsmodus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Die Detailakten verbinden Ansprechpartner, Termine, Pipeline und
                Dokumente pro Kunde in einer Ansicht.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                {canManage
                  ? "Vertrieb kann neue Kunden, Kontakte und Folgeaktivitaeten direkt aus dem Account anlegen."
                  : "Viewer erhalten Drill-down und Read-only Einsicht in die gesamte Kundenhistorie."}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
