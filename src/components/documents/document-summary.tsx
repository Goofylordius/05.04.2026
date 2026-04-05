import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { DocumentSnapshot } from "@/lib/types";

type DocumentSummaryProps = {
  snapshot: DocumentSnapshot;
};

export function DocumentSummary({ snapshot }: DocumentSummaryProps) {
  const { document, customer, company } = snapshot;

  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <CardTitle>{document.documentNo}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            Rechnungsteller
          </p>
          <p className="text-foreground font-medium">{company.legalName}</p>
          <p className="text-muted-foreground text-sm">
            {company.billingAddress.line1}
            <br />
            {company.billingAddress.postalCode} {company.billingAddress.city}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
            Kunde
          </p>
          <p className="text-foreground font-medium">{customer.companyName}</p>
          <p className="text-muted-foreground text-sm">
            {customer.billingAddress.line1}
            <br />
            {customer.billingAddress.postalCode} {customer.billingAddress.city}
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Leistungsdatum</span>
            <span>{formatDate(document.serviceDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Faelligkeit</span>
            <span>{formatDate(document.dueDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Profil</span>
            <span>{document.einvoiceProfile}</span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Netto</span>
            <span>{formatCurrency(document.subtotalNetCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">USt.</span>
            <span>{formatCurrency(document.taxTotalCents)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Brutto</span>
            <span>{formatCurrency(document.totalGrossCents)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
