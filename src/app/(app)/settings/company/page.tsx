import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionContext } from "@/lib/auth/session";
import { loadCompanyProfile } from "@/lib/data";

export default async function CompanySettingsPage() {
  await requireSessionContext("company.manage");
  const company = await loadCompanyProfile();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Rechtliche Stammdaten fuer Dokumente, Rechnungsversand und GoBD-nahe Ablage."
        eyebrow="Settings"
        title="Unternehmensprofil"
      />

      <Card className="surface-panel border-border/70 border">
        <CardHeader>
          <CardTitle>{company.legalName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">USt-IdNr.</span>
              <span>{company.vatId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Steuernummer</span>
              <span>{company.taxNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rechnungs-E-Mail</span>
              <span>{company.invoiceEmail}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IBAN</span>
              <span>{company.iban}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">BIC</span>
              <span>{company.bic}</span>
            </div>
            <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-3">
              {company.invoiceFooter}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
