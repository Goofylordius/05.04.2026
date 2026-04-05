import { notFound, redirect } from "next/navigation";

import {
  generateDocumentPdf,
  updateDocumentStatusAction,
} from "@/actions/documents";
import { DocumentSummary } from "@/components/documents/document-summary";
import { StatusBanner } from "@/components/status-banner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid } from "@/components/data-grid/data-grid";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { requireSessionContext } from "@/lib/auth/session";
import { loadDocumentSnapshot } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/format";

type DocumentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DocumentPage({
  params,
  searchParams,
}: DocumentPageProps) {
  const session = await requireSessionContext("documents.view");
  const canManage = session.permissions.includes("documents.manage");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const snapshot = await loadDocumentSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  async function regenerateAction() {
    "use server";

    await generateDocumentPdf(id);
    redirect(`/documents/${id}?generated=1`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Belegansicht mit deutschen Rechnungsfeldern, Versionierung und PDF-Generierung ueber React PDF."
        eyebrow="Documents"
        title={snapshot.document.documentNo}
        actions={
          canManage ? (
            <form action={regenerateAction}>
              <Button type="submit">PDF neu generieren</Button>
            </form>
          ) : null
        }
      />

      <StatusBanner
        error={query.error}
        message={
          typeof query.generated === "string"
            ? "PDF-Version wurde erzeugt und protokolliert."
            : query.message
        }
      />

      <DocumentSummary snapshot={snapshot} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Positionen</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              columns={[
                {
                  key: "description",
                  header: "Leistung",
                  cell: (row) => (
                    <div>
                      <div className="text-foreground font-medium">
                        {row.description}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {row.sku ?? "Kein SKU"}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "qty",
                  header: "Menge",
                  cell: (row) => row.qty.toFixed(2),
                },
                {
                  key: "unit",
                  header: "Einzelpreis",
                  cell: (row) => formatCurrency(row.unitNetCents),
                },
                {
                  key: "gross",
                  header: "Brutto",
                  cell: (row) => formatCurrency(row.lineGrossCents),
                },
              ]}
              emptyState="Keine Positionen vorhanden."
              rows={snapshot.items}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {canManage ? (
            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>Status steuern</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateDocumentStatusAction} className="space-y-4">
                  <input
                    name="documentId"
                    type="hidden"
                    value={snapshot.document.id}
                  />
                  <input
                    name="redirectTo"
                    type="hidden"
                    value={`/documents/${snapshot.document.id}`}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="status">Dokumentstatus</Label>
                    <NativeSelect
                      defaultValue={snapshot.document.status}
                      id="status"
                      name="status"
                    >
                      <option value="draft">Entwurf</option>
                      <option value="sent">Versendet</option>
                      <option value="accepted">Akzeptiert</option>
                      <option value="paid">Bezahlt</option>
                      <option value="cancelled">Storniert</option>
                      <option value="overdue">Ueberfaellig</option>
                    </NativeSelect>
                  </div>
                  <Button className="w-full" type="submit" variant="outline">
                    Status aktualisieren
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Compliance Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                UStG Pflichtfelder: Rechnungsnummer, Leistungsdatum, Steuersatz,
                Steuerbetrag und Rechnungsempfaenger sind enthalten.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                E-Invoicing: XML-Payload Platzhalter fuer EN 16931 ist
                gespeichert, aber in v1 noch nicht exportiert.
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Versionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.document.versions.map((version) => (
                <div
                  className="border-border/70 bg-background/25 rounded-2xl border p-3 text-sm"
                  key={version.id}
                >
                  <div className="text-foreground font-medium">
                    {version.storagePath}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {formatDateTime(version.generatedAt)}
                  </div>
                  <div className="text-muted-foreground mt-3 font-mono text-[11px]">
                    {version.sha256}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
