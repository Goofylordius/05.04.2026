import { saveCompanyProfileAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCompanyProfile } from "@/lib/data";

type CompanySettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanySettingsPage({
  searchParams,
}: CompanySettingsPageProps) {
  await requireSessionContext("company.manage");
  const [company, query] = await Promise.all([
    loadCompanyProfile(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Rechtliche Stammdaten fuer Belege, Rechnungsversand und die spaetere E-Rechnungslogik pflegen."
        eyebrow="Settings"
        title="Unternehmensprofil"
      />

      <StatusBanner error={query.error} message={query.message} />

      <form action={saveCompanyProfileAction} className="space-y-4">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Rechtliche Stammdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="legalName">Firmenname</Label>
                <Input
                  defaultValue={company.legalName}
                  id="legalName"
                  name="legalName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatId">USt-IdNr.</Label>
                <Input defaultValue={company.vatId} id="vatId" name="vatId" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Steuernummer</Label>
                <Input
                  defaultValue={company.taxNumber}
                  id="taxNumber"
                  name="taxNumber"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceEmail">Rechnungs-E-Mail</Label>
                <Input
                  defaultValue={company.invoiceEmail}
                  id="invoiceEmail"
                  name="invoiceEmail"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input defaultValue={company.iban} id="iban" name="iban" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bic">BIC</Label>
                <Input defaultValue={company.bic} id="bic" name="bic" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoiceFooter">Rechnungsfooter</Label>
                <Textarea
                  defaultValue={company.invoiceFooter}
                  id="invoiceFooter"
                  name="invoiceFooter"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Compliance Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Diese Werte werden fuer PDF-Belege, Steuerfelder und
                E-Mail-Workflows wiederverwendet.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                GoBD- und DSGVO-relevante Aenderungen sollten intern fachlich
                freigegeben werden, bevor sie produktiv genutzt werden.
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Rechnungsadresse</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="billingLine1">Strasse und Hausnummer</Label>
              <Input
                defaultValue={company.billingAddress.line1}
                id="billingLine1"
                name="billingLine1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingPostalCode">PLZ</Label>
              <Input
                defaultValue={company.billingAddress.postalCode}
                id="billingPostalCode"
                name="billingPostalCode"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCity">Ort</Label>
              <Input
                defaultValue={company.billingAddress.city}
                id="billingCity"
                name="billingCity"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="billingCountry">Land</Label>
              <Input
                defaultValue={company.billingAddress.country}
                id="billingCountry"
                name="billingCountry"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Unternehmensprofil speichern</Button>
        </div>
      </form>
    </div>
  );
}
