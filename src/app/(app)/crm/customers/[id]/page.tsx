import Link from "next/link";
import { notFound } from "next/navigation";

import { createContactAction, updateCustomerAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { requireSessionContext } from "@/lib/auth/session";
import { loadAuditLogs, loadCustomerWorkspace } from "@/lib/data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: CustomerDetailPageProps) {
  const session = await requireSessionContext("crm.view");
  const canManage = session.permissions.includes("crm.manage");
  const [query, workspace, auditEntries] = await Promise.all([
    searchParams,
    params.then(({ id: customerId }) => loadCustomerWorkspace(customerId)),
    loadAuditLogs(),
  ]);

  if (!workspace.customer) {
    notFound();
  }

  const { customer, contacts, deals, appointments, documents } = workspace;
  const relatedIds = new Set([
    customer.id,
    ...deals.map((deal) => deal.id),
    ...appointments.map((appointment) => appointment.id),
    ...documents.map((document) => document.id),
  ]);
  const relevantAudit = auditEntries
    .filter((entry) => entry.entityId && relatedIds.has(entry.entityId))
    .slice(0, 6);
  const pipelineCents = deals.reduce((sum, deal) => sum + deal.valueCents, 0);
  const nextAppointment = [...appointments].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt),
  )[0];

  return (
    <div className="space-y-6">
      <PageHeader
        description="360-Grad-Kundenakte mit Ansprechpartnern, Pipeline, Dokumenten und Aktivitaeten in einer Arbeitsflaeche."
        eyebrow="Account Workspace"
        title={customer.companyName}
        actions={
          canManage ? (
            <>
              <Button render={<Link href="/crm/deals/new" />} variant="outline">
                Neuer Deal
              </Button>
              <Button render={<Link href="/documents/new" />}>
                Neues Dokument
              </Button>
            </>
          ) : (
            <Button render={<Link href="/crm/customers" />} variant="outline">
              Zurueck
            </Button>
          )
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Health Score
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {customer.healthScore}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Pipeline
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {formatCurrency(pipelineCents)}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Ansprechpartner
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {contacts.length}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Naechster Termin
            </p>
            <p className="text-foreground text-sm font-medium">
              {nextAppointment
                ? formatDateTime(nextAppointment.startsAt)
                : "Nicht gesetzt"}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <div className="space-y-4">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Kontoueberblick</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Branche</span>
                  <span>{customer.industry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">USt-IdNr.</span>
                  <span>{customer.vatId ?? "Nicht gepflegt"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">E-Mail</span>
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Telefon</span>
                  <span>{customer.phone}</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border-border/70 bg-background/25 rounded-2xl border p-3 text-sm">
                  <p className="text-muted-foreground text-xs uppercase">
                    Rechnungsadresse
                  </p>
                  <p className="text-foreground mt-3">
                    {customer.billingAddress.line1}
                    <br />
                    {customer.billingAddress.postalCode}{" "}
                    {customer.billingAddress.city}
                  </p>
                </div>
                <div className="border-border/70 bg-background/25 rounded-2xl border p-3 text-sm">
                  <p className="text-muted-foreground text-xs uppercase">
                    Lieferadresse
                  </p>
                  <p className="text-foreground mt-3">
                    {customer.shippingAddress
                      ? `${customer.shippingAddress.line1}\n${customer.shippingAddress.postalCode} ${customer.shippingAddress.city}`
                      : "Entspricht Rechnungsadresse"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Ansprechpartner</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {contacts.length === 0 ? (
                <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                  Noch keine Ansprechpartner gepflegt.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    className="border-border/70 bg-background/25 rounded-2xl border p-3"
                    key={contact.id}
                  >
                    <p className="text-foreground font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {contact.jobTitle}
                    </p>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {contact.email}
                      <br />
                      {contact.phone}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Deals und Dokumente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
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
                        <div className="text-muted-foreground text-xs capitalize">
                          {row.stage}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "value",
                    header: "Wert",
                    cell: (row) => formatCurrency(row.valueCents),
                  },
                ]}
                emptyState="Keine Deals vorhanden."
                getRowKey={(row) => row.id}
                rows={deals}
              />
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
                emptyState="Keine Dokumente vorhanden."
                getRowKey={(row) => row.id}
                rows={documents}
              />
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Termine und Aktivitaet</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    Noch keine Termine.
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      className="border-border/70 bg-background/25 rounded-2xl border p-3"
                      key={appointment.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-foreground font-medium">
                            {appointment.title}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDateTime(appointment.startsAt)}
                          </p>
                        </div>
                        <Badge variant="outline">{appointment.syncState}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-3">
                {relevantAudit.length === 0 ? (
                  <div className="text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
                    Noch keine protokollierten Aenderungen.
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
            <>
              <Card className="surface-panel border-border/70 border">
                <CardHeader>
                  <CardTitle>Kunde bearbeiten</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={updateCustomerAction} className="space-y-4">
                    <input
                      name="customerId"
                      type="hidden"
                      value={customer.id}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="type">Typ</Label>
                      <NativeSelect
                        defaultValue={customer.type}
                        id="type"
                        name="type"
                      >
                        <option value="company">Unternehmen</option>
                        <option value="person">Person</option>
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Kundenname</Label>
                      <Input
                        defaultValue={customer.companyName}
                        id="companyName"
                        name="companyName"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input
                          defaultValue={customer.email}
                          id="email"
                          name="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          defaultValue={customer.phone}
                          id="phone"
                          name="phone"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Branche</Label>
                        <Input
                          defaultValue={customer.industry}
                          id="industry"
                          name="industry"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vatId">USt-IdNr.</Label>
                        <Input
                          defaultValue={customer.vatId ?? ""}
                          id="vatId"
                          name="vatId"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="billingLine1">Rechnungsadresse</Label>
                        <Input
                          defaultValue={customer.billingAddress.line1}
                          id="billingLine1"
                          name="billingLine1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingPostalCode">PLZ</Label>
                        <Input
                          defaultValue={customer.billingAddress.postalCode}
                          id="billingPostalCode"
                          name="billingPostalCode"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingCity">Ort</Label>
                        <Input
                          defaultValue={customer.billingAddress.city}
                          id="billingCity"
                          name="billingCity"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="billingCountry">Land</Label>
                        <Input
                          defaultValue={customer.billingAddress.country}
                          id="billingCountry"
                          name="billingCountry"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shippingLine1">Lieferadresse</Label>
                        <Input
                          defaultValue={customer.shippingAddress?.line1 ?? ""}
                          id="shippingLine1"
                          name="shippingLine1"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shippingLine2">Adresszusatz</Label>
                        <Input
                          defaultValue={customer.shippingAddress?.line2 ?? ""}
                          id="shippingLine2"
                          name="shippingLine2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingPostalCode">PLZ</Label>
                        <Input
                          defaultValue={
                            customer.shippingAddress?.postalCode ?? ""
                          }
                          id="shippingPostalCode"
                          name="shippingPostalCode"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">Ort</Label>
                        <Input
                          defaultValue={customer.shippingAddress?.city ?? ""}
                          id="shippingCity"
                          name="shippingCity"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shippingCountry">Land</Label>
                        <Input
                          defaultValue={
                            customer.shippingAddress?.country ?? "Deutschland"
                          }
                          id="shippingCountry"
                          name="shippingCountry"
                        />
                      </div>
                    </div>
                    <Button className="w-full" type="submit">
                      Kundendaten speichern
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="surface-panel border-border/70 border">
                <CardHeader>
                  <CardTitle>Neuen Ansprechpartner anlegen</CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={createContactAction} className="space-y-4">
                    <input
                      name="customerId"
                      type="hidden"
                      value={customer.id}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input id="firstName" name="firstName" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input id="lastName" name="lastName" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Rolle</Label>
                      <Input id="jobTitle" name="jobTitle" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">E-Mail</Label>
                      <Input id="contactEmail" name="email" type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefon</Label>
                      <Input id="contactPhone" name="phone" />
                    </div>
                    <Button className="w-full" type="submit">
                      Ansprechpartner speichern
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>Lesemodus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                  Rolle `{session.role}` hat keinen Schreibzugriff auf diese
                  Akte.
                </div>
                <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                  Du kannst dennoch Deals, Dokumente und Termine bis auf
                  Belegebene nachvollziehen.
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Naechste Schritte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Offene Dokumente:{" "}
                {documents.filter((doc) => doc.status !== "paid").length}
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Letztes erwartetes Close Date:{" "}
                {deals.length > 0
                  ? formatDate(
                      [...deals].sort((left, right) =>
                        right.expectedCloseDate.localeCompare(
                          left.expectedCloseDate,
                        ),
                      )[0].expectedCloseDate,
                    )
                  : "Nicht vorhanden"}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
