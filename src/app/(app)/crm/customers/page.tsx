import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DataGrid } from "@/components/data-grid/data-grid";
import { PageHeader } from "@/components/page-header";
import { requireSessionContext } from "@/lib/auth/session";
import { loadContacts, loadCustomers } from "@/lib/data";

export default async function CustomersPage() {
  await requireSessionContext("crm.view");
  const [customerRows, contactRows] = await Promise.all([
    loadCustomers(),
    loadContacts(),
  ]);
  const selectedCustomer = customerRows[0];
  const selectedContacts = contactRows.filter(
    (contact) => contact.customerId === selectedCustomer?.id,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        description="Split-Pane Ansicht fuer Account-Management, Ansprechpartner und kaufmaennische Stammdaten."
        eyebrow="CRM"
        title="Kunden"
      />

      <ResizablePanelGroup
        className="border-border/70 min-h-[680px] overflow-hidden rounded-[28px] border"
        orientation="horizontal"
      >
        <ResizablePanel defaultSize={44} minSize={34}>
          <div className="h-full p-4">
            <DataGrid
              columns={[
                {
                  key: "company",
                  header: "Konto",
                  cell: (row) => (
                    <div>
                      <div className="text-foreground font-medium">
                        {row.companyName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {row.industry}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "mail",
                  header: "Kontakt",
                  cell: (row) => (
                    <div className="text-muted-foreground text-sm">
                      {row.email}
                    </div>
                  ),
                },
                {
                  key: "health",
                  header: "Health",
                  className: "text-right",
                  cell: (row) => (
                    <Badge
                      className="border-border/80 bg-background/60 text-foreground"
                      variant="outline"
                    >
                      {row.healthScore}
                    </Badge>
                  ),
                },
              ]}
              emptyState="Keine Kunden gefunden."
              rows={customerRows}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-border/70" withHandle />
        <ResizablePanel defaultSize={56}>
          <div className="grid h-full gap-4 p-4 lg:grid-cols-2">
            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>{selectedCustomer?.companyName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Branche</span>
                  <span>{selectedCustomer?.industry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">USt-IdNr.</span>
                  <span>{selectedCustomer?.vatId ?? "Nicht gepflegt"}</span>
                </div>
                <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-3">
                  {selectedCustomer?.billingAddress.line1}
                  <br />
                  {selectedCustomer?.billingAddress.postalCode}{" "}
                  {selectedCustomer?.billingAddress.city}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel border-border/70 border">
              <CardHeader>
                <CardTitle>Ansprechpartner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedContacts.map((contact) => (
                  <div
                    className="border-border/70 bg-background/25 rounded-2xl border p-3"
                    key={contact.id}
                  >
                    <div className="text-foreground font-medium">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {contact.jobTitle}
                    </div>
                    <div className="text-muted-foreground mt-3 text-sm">
                      {contact.email}
                      <br />
                      {contact.phone}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="surface-panel border-border/70 border lg:col-span-2">
              <CardHeader>
                <CardTitle>Account Notes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-3">
                <div className="border-border/70 bg-background/25 rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                    Renewal Risk
                  </p>
                  <p className="text-foreground mt-3 text-2xl font-semibold">
                    Low
                  </p>
                </div>
                <div className="border-border/70 bg-background/25 rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                    Last Touch
                  </p>
                  <p className="text-foreground mt-3 text-2xl font-semibold">
                    2 Tage
                  </p>
                </div>
                <div className="border-border/70 bg-background/25 rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                    Open Documents
                  </p>
                  <p className="text-foreground mt-3 text-2xl font-semibold">
                    3
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
