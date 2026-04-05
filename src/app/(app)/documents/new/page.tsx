import Link from "next/link";

import { createDocumentDraftAction } from "@/actions/documents";
import { StatusBanner } from "@/components/status-banner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCompanyProfile, loadCustomers } from "@/lib/data";

type NewDocumentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewDocumentPage({
  searchParams,
}: NewDocumentPageProps) {
  await requireSessionContext("documents.manage");
  const [query, customers, company] = await Promise.all([
    searchParams,
    loadCustomers(),
    loadCompanyProfile(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Dokumententwurf mit deutscher Steuerlogik, Positionen und vorbereitetem E-Invoicing-Profil anlegen."
        eyebrow="Document Setup"
        title="Neues Dokument"
        actions={
          <Button render={<Link href="/documents" />} variant="outline">
            Zurueck
          </Button>
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <form action={createDocumentDraftAction} className="space-y-4">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Belegdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerId">Kunde</Label>
                <NativeSelect id="customerId" name="customerId">
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kind">Typ</Label>
                <NativeSelect defaultValue="quote" id="kind" name="kind">
                  <option value="quote">Angebot</option>
                  <option value="invoice">Rechnung</option>
                  <option value="credit_note">Gutschrift</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <NativeSelect defaultValue="draft" id="status" name="status">
                  <option value="draft">Entwurf</option>
                  <option value="sent">Versendet</option>
                  <option value="accepted">Akzeptiert</option>
                  <option value="paid">Bezahlt</option>
                  <option value="cancelled">Storniert</option>
                  <option value="overdue">Ueberfaellig</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">Belegdatum</Label>
                <Input
                  defaultValue={today}
                  id="issueDate"
                  name="issueDate"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Leistungsdatum</Label>
                <Input id="serviceDate" name="serviceDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Faelligkeit</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Zahlungsziel</Label>
                <Input
                  defaultValue="14 Tage netto"
                  id="paymentTerms"
                  name="paymentTerms"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="legalFooter">Rechtlicher Footer</Label>
                <Textarea
                  defaultValue={company.invoiceFooter}
                  id="legalFooter"
                  name="legalFooter"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Dokumentnummern werden atomar ueber `next_document_number()`
                vergeben.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Das System speichert ein EN16931-Ready Profil, exportiert im MVP
                aber noch keine XML-Datei.
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Positionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                className="grid gap-3 rounded-2xl border border-dashed p-3 md:grid-cols-[1fr_120px_140px_120px_180px]"
                key={index}
              >
                <div className="space-y-2">
                  <Label htmlFor={`itemDescription-${index}`}>
                    Beschreibung
                  </Label>
                  <Input
                    id={`itemDescription-${index}`}
                    name="itemDescription"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`itemQty-${index}`}>Menge</Label>
                  <Input
                    defaultValue="1"
                    id={`itemQty-${index}`}
                    name="itemQty"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`itemUnitNet-${index}`}>Netto EUR</Label>
                  <Input id={`itemUnitNet-${index}`} name="itemUnitNet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`itemTaxRate-${index}`}>USt. %</Label>
                  <Input
                    defaultValue="19"
                    id={`itemTaxRate-${index}`}
                    name="itemTaxRate"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`itemSku-${index}`}>SKU / Referenz</Label>
                  <Input id={`itemSku-${index}`} name="itemSku" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button render={<Link href="/documents" />} variant="outline">
            Abbrechen
          </Button>
          <Button type="submit">Entwurf anlegen</Button>
        </div>
      </form>
    </div>
  );
}
