import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/data-grid/data-grid";
import { requireSessionContext } from "@/lib/auth/session";
import { loadAppointments, loadCalendarConnection } from "@/lib/data";
import { isGoogleCalendarConfigured } from "@/lib/env";
import { formatDateTime } from "@/lib/format";

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const session = await requireSessionContext("calendar.view");
  const [connection, appointmentRows, query] = await Promise.all([
    loadCalendarConnection(session.user.id),
    loadAppointments(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Google Calendar Anbindung pro Benutzer inklusive Status, letzte Synchronisation und CRM-Mirror-Termine."
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

      {typeof query.error === "string" ? (
        <div className="border-destructive/40 bg-destructive/10 text-foreground rounded-2xl border p-3 text-sm">
          {query.error}
        </div>
      ) : null}

      {typeof query.message === "string" ? (
        <div className="border-primary/40 bg-primary/10 text-foreground rounded-2xl border p-3 text-sm">
          {query.message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Connection State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{connection.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Google Konto</span>
              <span>{connection.googleEmail ?? "Nicht verbunden"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Sync</span>
              <span>{formatDateTime(connection.lastSyncedAt)}</span>
            </div>
            <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-3">
              Konfliktregel in v1: CRM-Metadaten bleiben lokal, spiegelbare
              Event-Felder folgen dem aktuellsten Sync-Zeitstempel.
            </div>
          </CardContent>
        </Card>

        <DataGrid
          columns={[
            {
              key: "title",
              header: "Termin",
              cell: (row) => (
                <div>
                  <div className="text-foreground font-medium">{row.title}</div>
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
          rows={appointmentRows}
        />
      </section>
    </div>
  );
}
