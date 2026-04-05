import Link from "next/link";

import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCustomers, loadDocuments } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";

type DocumentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const session = await requireSessionContext("documents.view");
  const canManage = session.permissions.includes("documents.manage");
  const [documentRows, customerRows, query] = await Promise.all([
    loadDocuments(),
    loadCustomers(),
    searchParams,
  ]);
  const customerMap = new Map(
    customerRows.map((customer) => [customer.id, customer.companyName]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        description="Dokumenten-Center fuer Angebote, Rechnungen und Mahnrisiken inklusive PDF-Generierung und Statussteuerung."
        eyebrow="Documents"
        title="Dokumente"
        actions={
          canManage ? (
            <Button render={<Link href="/documents/new" />}>
              Neues Dokument
            </Button>
          ) : undefined
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Entwuerfe",
            value: documentRows.filter(
              (document) => document.status === "draft",
            ).length,
          },
          {
            label: "Versendet",
            value: documentRows.filter((document) => document.status === "sent")
              .length,
          },
          {
            label: "Ueberfaellig",
            value: documentRows.filter(
              (document) => document.status === "overdue",
            ).length,
          },
          {
            label: "Volumen",
            value: formatCurrency(
              documentRows.reduce(
                (sum, document) => sum + document.totalGrossCents,
                0,
              ),
            ),
          },
        ].map((metric) => (
          <Card
            className="surface-panel border-border/70 border"
            key={metric.label}
          >
            <CardContent className="space-y-2 py-6">
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                {metric.label}
              </p>
              <p className="text-foreground text-3xl font-semibold">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={[
                {
                  key: "document",
                  header: "Dokument",
                  cell: (row) => (
                    <div>
                      <Link
                        className="text-foreground font-medium hover:underline"
                        href={`/documents/${row.id}`}
                      >
                        {row.documentNo}
                      </Link>
                      <div className="text-muted-foreground text-xs capitalize">
                        {row.kind}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "customer",
                  header: "Kunde",
                  cell: (row) =>
                    customerMap.get(row.customerId) ?? "Unbekannter Kunde",
                },
                {
                  key: "issueDate",
                  header: "Belegdatum",
                  cell: (row) => formatDate(row.issueDate),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (row) => (
                    <Badge variant="outline" className="capitalize">
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  key: "total",
                  header: "Brutto",
                  cell: (row) => formatCurrency(row.totalGrossCents),
                },
              ]}
              emptyState="Keine Dokumente vorhanden."
              getRowKey={(row) => row.id}
              rows={documentRows}
            />
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Ops Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
              PDF-Generierung ist direkt an jedem Dokument verfuegbar. Versionen
              werden pro Beleg historisiert.
            </div>
            <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
              ZUGFeRD/XRechnung bleiben im MVP als strukturierte Platzhalter
              gespeichert, damit die spaetere XML-Ausgabe vorbereitet ist.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
