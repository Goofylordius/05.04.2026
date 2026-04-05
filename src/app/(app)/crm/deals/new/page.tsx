import Link from "next/link";

import { createDealAction } from "@/actions/crm";
import { StatusBanner } from "@/components/status-banner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCustomers } from "@/lib/data";

type NewDealPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewDealPage({ searchParams }: NewDealPageProps) {
  await requireSessionContext("crm.manage");
  const [query, customers] = await Promise.all([searchParams, loadCustomers()]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Neue Opportunity mit Kundenbezug, Forecast und Bearbeitungsnotizen anlegen."
        eyebrow="Pipeline Setup"
        title="Neuer Deal"
        actions={
          <Button render={<Link href="/crm/deals" />} variant="outline">
            Zurueck
          </Button>
        }
      />

      <StatusBanner error={query.error} message={query.message} />

      <form action={createDealAction}>
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Opportunity</CardTitle>
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Deal-Name</Label>
                <Input id="title" name="title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <NativeSelect defaultValue="lead" id="stage" name="stage">
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
                  id="expectedCloseDate"
                  name="expectedCloseDate"
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valueEuros">Deal-Wert in EUR</Label>
                <Input id="valueEuros" name="valueEuros" placeholder="12500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Win-Rate in %</Label>
                <Input
                  defaultValue="50"
                  id="probability"
                  max="100"
                  min="0"
                  name="probability"
                  type="number"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Bearbeitungsnotizen</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Naechster Schritt, Risiko, Entscheider, Angebotslage..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel border-border/70 border">
            <CardHeader>
              <CardTitle>Playbook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Stage und Win-Rate treiben sofort Forecast, Stage-Board und
                Deal-Detail.
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-3">
                Nach dem Speichern kann aus dem Deal direkt ein Dokumententwurf
                erzeugt werden.
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button render={<Link href="/crm/deals" />} variant="outline">
            Abbrechen
          </Button>
          <Button type="submit">Deal anlegen</Button>
        </div>
      </form>
    </div>
  );
}
