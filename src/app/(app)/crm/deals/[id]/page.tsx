import Link from "next/link";
import { notFound } from "next/navigation";

import { updateDealAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionContext } from "@/lib/auth/session";
import {
  loadAppointments,
  loadAuditLogs,
  loadCustomerById,
  loadDealById,
  loadCustomers,
  loadDocuments,
} from "@/lib/data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

type DealDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DealDetailPage({
  params,
  searchParams,
}: DealDetailPageProps) {
  const session = await requireSessionContext("crm.view");
  const canManage = session.permissions.includes("crm.manage");
  const [query, customers, deal, appointments, documents, auditEntries] =
    await Promise.all([
      searchParams,
      loadCustomers(),
      params.then(({ id: dealId }) => loadDealById(dealId)),
      loadAppointments(),
      loadDocuments(),
      loadAuditLogs(),
    ]);

  if (!deal) {
    notFound();
  }

  const customer = await loadCustomerById(deal.customerId);

  if (!customer) {
    notFound();
  }

  const relatedAppointments = appointments.filter(
    (appointment) => appointment.customerId === customer.id,
  );
  const relatedDocuments = documents.filter(
    (document) => document.customerId === customer.id,
  );
  const relevantAudit = auditEntries
    .filter(
      (entry) => entry.entityId === deal.id || entry.entityId === customer.id,
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Opportunity-Akte mit Forecast, Notes, Dokumenten-Backlog und verknuepften Kundenterminen."
        eyebrow="Deal Workspace"
        title={deal.title}
        actions={
          <>
            <Button
              render={<Link href={`/crm/customers/${customer.id}`} />}
              variant="outline"
            >
              Kunde
            </Button>
            {canManage ? (
              <Button render={<Link href="/documents/new" />}>
                Dokument erstellen
              </Button>
            ) : null}
          </>
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Kunde
            </p>
            <p className="text-foreground text-sm font-medium">
              {customer.companyName}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Deal-Wert
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {formatCurrency(deal.valueCents)}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Win-Rate
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {deal.probability}%
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Close Date
            </p>
            <p className="text-foreground text-sm font-medium">
              {formatDate(deal.expectedCloseDate)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="space-y-4">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Opportunity Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stage</span>
                  <Badge variant="outline">{deal.stage}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kunde</span>
                  <span>{customer.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Branche</span>
                  <span>{customer.industry}</span>
                </div>
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-4 text-sm">
                <p className="text-muted-foreground text-xs uppercase">Notes</p>
                <p className="text-foreground mt-3 whitespace-pre-wrap">
                  {deal.notes ?? "Noch keine Bearbeitungsnotizen vorhanden."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Verknuepfte Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <DataGrid
                columns={[
                  {
                    key: "number",
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
                    key: "status",
                    header: "Status",
                    cell: (row) => row.status,
                  },
                  {
                    key: "total",
                    header: "Brutto",
                    cell: (row) => formatCurrency(row.totalGrossCents),
                  },
                ]}
                emptyState="Keine Dokumente fuer diesen Kunden."
                getRowKey={(row) => row.id}
                rows={relatedDocuments}
              />
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Kalender und Aktivitaet</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {relatedAppointments.length === 0 ? (
                  <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    Keine verknuepften Termine.
                  </div>
                ) : (
                  relatedAppointments.map((appointment) => (
                    <div
                      className="border-border/70 bg-background/25 rounded-2xl border p-3"
                      key={appointment.id}
                    >
                      <p className="text-foreground font-medium">
                        {appointment.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDateTime(appointment.startsAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-3">
                {relevantAudit.length === 0 ? (
                  <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    Keine protokollierten Aenderungen.
                  </div>
                ) : (
                  relevantAudit.map((entry) => (
                    <div
                      className="border-border/70 bg-background/25 rounded-2xl border p-3"
                      key={entry.id}
                    >
                      <p className="text-foreground font-medium">
                        {entry.action}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {canManage ? (
            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>Deal bearbeiten</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateDealAction} className="space-y-4">
                  <input name="dealId" type="hidden" value={deal.id} />
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Kunde</Label>
                    <NativeSelect
                      defaultValue={customer.id}
                      id="customerId"
                      name="customerId"
                    >
                      {customers.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.companyName}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Deal-Name</Label>
                    <Input defaultValue={deal.title} id="title" name="title" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stage">Stage</Label>
                      <NativeSelect
                        defaultValue={deal.stage}
                        id="stage"
                        name="stage"
                      >
                        <option value="lead">Lead</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expectedCloseDate">Expected Close</Label>
                      <Input
                        defaultValue={deal.expectedCloseDate}
                        id="expectedCloseDate"
                        name="expectedCloseDate"
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valueEuros">Deal-Wert in EUR</Label>
                      <Input
                        defaultValue={(deal.valueCents / 100).toFixed(2)}
                        id="valueEuros"
                        name="valueEuros"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="probability">Win-Rate in %</Label>
                      <Input
                        defaultValue={String(deal.probability)}
                        id="probability"
                        max="100"
                        min="0"
                        name="probability"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Bearbeitungsnotizen</Label>
                    <Textarea
                      defaultValue={deal.notes ?? ""}
                      id="notes"
                      name="notes"
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    Deal speichern
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Deal-Momentum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Erwarteter Umsatzbeitrag: {formatCurrency(deal.valueCents)}
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Kundennaechster Termin:{" "}
                {relatedAppointments[0]
                  ? formatDateTime(relatedAppointments[0].startsAt)
                  : "Noch kein Termin gesetzt"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
