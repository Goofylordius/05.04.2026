import Link from "next/link";

import { createCustomerAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { requireSessionContext } from "@/lib/auth/session";

type NewCustomerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCustomerPage({
  searchParams,
}: NewCustomerPageProps) {
  await requireSessionContext("crm.manage");
  const query = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        description="Neuen Account inklusive Rechnungs- und Lieferadresse fuer Vertrieb, Service und Dokumentenmodul anlegen."
        eyebrow="CRM Setup"
        title="Neuer Kunde"
        actions={
          <Button render={<Link href="/crm/customers" />} variant="outline">
            Zurueck
          </Button>
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <form action={createCustomerAction}>
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Kontostammdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <NativeSelect defaultValue="company" id="type" name="type">
                  <option value="company">Unternehmen</option>
                  <option value="person">Person</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Branche</Label>
                <Input defaultValue="Allgemein" id="industry" name="industry" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">Kundenname</Label>
                <Input id="companyName" name="companyName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="vatId">USt-IdNr.</Label>
                <Input id="vatId" name="vatId" />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Direkt nach dem Speichern steht der Kunde fuer Deals, Termine
                und Dokumententwuerfe zur Verfuegung.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Lieferadresse ist optional. Wenn sie leer bleibt, arbeitet das
                MVP mit der Rechnungsadresse.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-2">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Rechnungsadresse</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billingLine1">Strasse und Hausnummer</Label>
                <Input id="billingLine1" name="billingLine1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPostalCode">PLZ</Label>
                <Input id="billingPostalCode" name="billingPostalCode" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCity">Ort</Label>
                <Input id="billingCity" name="billingCity" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billingCountry">Land</Label>
                <Input
                  defaultValue="Deutschland"
                  id="billingCountry"
                  name="billingCountry"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Lieferadresse</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingLine1">Strasse und Hausnummer</Label>
                <Input id="shippingLine1" name="shippingLine1" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingLine2">Adresszusatz</Label>
                <Input id="shippingLine2" name="shippingLine2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPostalCode">PLZ</Label>
                <Input id="shippingPostalCode" name="shippingPostalCode" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCity">Ort</Label>
                <Input id="shippingCity" name="shippingCity" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shippingCountry">Land</Label>
                <Input
                  defaultValue="Deutschland"
                  id="shippingCountry"
                  name="shippingCountry"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button render={<Link href="/crm/customers" />} variant="outline">
            Abbrechen
          </Button>
          <Button type="submit">Kunde anlegen</Button>
        </div>
      </form>
    </div>
  );
}
