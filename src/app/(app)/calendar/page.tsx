import Link from "next/link";

import { createAppointmentAction, syncCalendarNowAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionContext } from "@/lib/auth/session";
import {
  loadAppointments,
  loadCalendarConnection,
  loadCustomers,
} from "@/lib/data";
import { isGoogleCalendarConfigured } from "@/lib/env";
import { formatDateTime } from "@/lib/format";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const session = await requireSessionContext("calendar.view");
  const canManage = session.permissions.includes("calendar.manage");
  const [connection, appointmentRows, customerRows, query] = await Promise.all([
    loadCalendarConnection(session.user.id),
    loadAppointments(),
    loadCustomers(),
    searchParams,
  ]);

  const syncStateCounters = {
    synced: appointmentRows.filter((item) => item.syncState === "synced")
      .length,
    pending: appointmentRows.filter((item) => item.syncState === "pending_push")
      .length,
    issue: appointmentRows.filter(
      (item) =>
        item.syncState === "sync_error" || item.syncState === "disconnected",
    ).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Kalenderarbeitsflaeche mit Verbindungsstatus, manueller Synchronisation und lokaler Terminanlage fuer das Vertriebsteam."
        eyebrow="Calendar Sync"
        title="Kalender"
        actions={
          isGoogleCalendarConfigured() ? (
            <Button render={<Link href="/api/google/calendar/connect" />}>
              Google verbinden
            </Button>
          ) : (
            <Button disabled>Google nicht konfiguriert</Button>
          )
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Status
            </p>
            <p className="text-foreground text-2xl font-semibold capitalize">
              {connection.status}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Termine synchronisiert
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {syncStateCounters.synced}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-panel border-border/70 border">
          <CardContent className="space-y-2 py-6">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Pending / Issues
            </p>
            <p className="text-foreground text-3xl font-semibold">
              {syncStateCounters.pending + syncStateCounters.issue}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Connection State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Google Konto</span>
                <span>{connection.googleEmail ?? "Nicht verbunden"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Sync</span>
                <span>{formatDateTime(connection.lastSyncedAt)}</span>
              </div>
              <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-3">
                Konfliktregel im MVP: CRM-Metadaten bleiben lokal, spiegelbare
                Event-Felder folgen dem aktuellsten Sync-Zeitstempel.
              </div>
              {canManage ? (
                <form action={syncCalendarNowAction}>
                  <input name="redirectTo" type="hidden" value="/calendar" />
                  <Button className="w-full" type="submit" variant="outline">
                    Jetzt synchronisieren
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>

          {canManage ? (
            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>Termin anlegen</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createAppointmentAction} className="space-y-4">
                  <input name="redirectTo" type="hidden" value="/calendar" />
                  <div className="space-y-2">
                    <Label htmlFor="title">Terminname</Label>
                    <Input id="title" name="title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Kunde</Label>
                    <NativeSelect id="customerId" name="customerId">
                      <option value="">Ohne Kundenbezug</option>
                      {customerRows.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startsAt">Start</Label>
                      <Input
                        id="startsAt"
                        name="startsAt"
                        type="datetime-local"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endsAt">Ende</Label>
                      <Input id="endsAt" name="endsAt" type="datetime-local" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ort</Label>
                    <Input id="location" name="location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notizen</Label>
                    <Textarea id="notes" name="notes" />
                  </div>
                  <label className="border-border/70 bg-background/25 flex items-center gap-3 rounded-2xl border p-3 text-sm">
                    <input
                      className="accent-primary"
                      name="syncToGoogle"
                      type="checkbox"
                    />
                    Sofort zu Google spiegeln
                  </label>
                  <Button className="w-full" type="submit">
                    Termin speichern
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Terminregister</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={[
                {
                  key: "title",
                  header: "Termin",
                  cell: (row) => (
                    <div>
                      <div className="text-foreground font-medium">
                        {row.title}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {row.location ?? "Remote"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "start",
                  header: "Start",
                  cell: (row) => formatDateTime(row.startsAt),
                },
                {
                  key: "end",
                  header: "Ende",
                  cell: (row) => formatDateTime(row.endsAt),
                },
                {
                  key: "state",
                  header: "Sync State",
                  cell: (row) => row.syncState,
                },
              ]}
              emptyState="Keine Termine vorhanden."
              getRowKey={(row) => row.id}
              rows={appointmentRows}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
