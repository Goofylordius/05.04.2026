import type {
  Appointment,
  AuditLogEntry,
  CalendarConnection,
  CompanyProfile,
  Contact,
  Customer,
  Deal,
  DashboardMetric,
  DocumentLineItem,
  DocumentRecord,
  DocumentSnapshot,
  SessionContext,
} from "@/lib/types";

export const demoSession: SessionContext = {
  mode: "demo",
  role: "admin",
  permissions: [
    "dashboard.view",
    "crm.view",
    "crm.manage",
    "documents.view",
    "documents.manage",
    "calendar.view",
    "calendar.manage",
    "company.manage",
    "security.manage",
    "users.manage",
    "audit.view",
  ],
  user: {
    id: "demo-admin",
    email: "leitung@klarocrm.de",
    fullName: "Mara Winter",
    avatarFallback: "MW",
  },
};

export const companyProfile: CompanyProfile = {
  id: "company-1",
  legalName: "Klaro Vertriebssysteme GmbH",
  vatId: "DE318761245",
  taxNumber: "47/928/12045",
  iban: "DE69500105170648489890",
  bic: "INGDDEFFXXX",
  invoiceEmail: "buchhaltung@klarocrm.de",
  invoiceFooter:
    "Geschaeftsfuehrung: Mara Winter. Amtsgericht Berlin-Charlottenburg, HRB 219443 B.",
  billingAddress: {
    line1: "Friedrichstrasse 141",
    postalCode: "10117",
    city: "Berlin",
    country: "Deutschland",
  },
};

export const customers: Customer[] = [
  {
    id: "customer-1",
    type: "company",
    companyName: "Nordlicht Maschinenbau GmbH",
    vatId: "DE129837465",
    email: "einkauf@nordlicht.example",
    phone: "+49 40 2210 400",
    billingAddress: {
      line1: "Schanzenstrasse 14",
      postalCode: "20357",
      city: "Hamburg",
      country: "Deutschland",
    },
    shippingAddress: {
      line1: "Werkstrasse 4",
      postalCode: "21465",
      city: "Reinbek",
      country: "Deutschland",
    },
    industry: "Maschinenbau",
    ownerUserId: demoSession.user.id,
    healthScore: 88,
  },
  {
    id: "customer-2",
    type: "company",
    companyName: "Helios Energie Consulting AG",
    vatId: "DE255009832",
    email: "office@helios.example",
    phone: "+49 89 3051 88",
    billingAddress: {
      line1: "Leopoldstrasse 23",
      postalCode: "80802",
      city: "Muenchen",
      country: "Deutschland",
    },
    industry: "Energie",
    ownerUserId: demoSession.user.id,
    healthScore: 72,
  },
  {
    id: "customer-3",
    type: "company",
    companyName: "WerkForm Innenausbau KG",
    vatId: "DE192772100",
    email: "projekte@werkform.example",
    phone: "+49 211 8841 22",
    billingAddress: {
      line1: "Bahnstrasse 37",
      postalCode: "40210",
      city: "Duesseldorf",
      country: "Deutschland",
    },
    industry: "Innenausbau",
    ownerUserId: demoSession.user.id,
    healthScore: 64,
  },
];

export const contacts: Contact[] = [
  {
    id: "contact-1",
    customerId: "customer-1",
    firstName: "Lena",
    lastName: "Kunz",
    email: "lena.kunz@nordlicht.example",
    phone: "+49 40 2210 440",
    jobTitle: "Leitung Einkauf",
  },
  {
    id: "contact-2",
    customerId: "customer-1",
    firstName: "Sebastian",
    lastName: "Dreher",
    email: "sebastian.dreher@nordlicht.example",
    phone: "+49 40 2210 417",
    jobTitle: "Betriebsleiter",
  },
  {
    id: "contact-3",
    customerId: "customer-2",
    firstName: "Mina",
    lastName: "Vogt",
    email: "mina.vogt@helios.example",
    phone: "+49 89 3051 27",
    jobTitle: "Senior Consultant",
  },
];

export const deals: Deal[] = [
  {
    id: "deal-1",
    customerId: "customer-1",
    ownerUserId: demoSession.user.id,
    title: "Servicevertrag Nordlicht 2026",
    stage: "negotiation",
    valueCents: 1860000,
    probability: 74,
    expectedCloseDate: "2026-04-26",
    updatedAt: "2026-04-05T08:40:00.000Z",
  },
  {
    id: "deal-2",
    customerId: "customer-2",
    ownerUserId: demoSession.user.id,
    title: "CRM Rollout Helios West",
    stage: "proposal",
    valueCents: 2485000,
    probability: 58,
    expectedCloseDate: "2026-05-18",
    updatedAt: "2026-04-04T15:14:00.000Z",
  },
  {
    id: "deal-3",
    customerId: "customer-3",
    ownerUserId: demoSession.user.id,
    title: "Q2 Angebotsserie WerkForm",
    stage: "qualified",
    valueCents: 945000,
    probability: 43,
    expectedCloseDate: "2026-04-19",
    updatedAt: "2026-04-03T11:08:00.000Z",
  },
];

export const appointments: Appointment[] = [
  {
    id: "appointment-1",
    ownerUserId: demoSession.user.id,
    customerId: "customer-1",
    title: "Finale Preisrunde Nordlicht",
    googleEventId: "google-demo-1",
    startsAt: "2026-04-07T09:00:00.000Z",
    endsAt: "2026-04-07T09:45:00.000Z",
    location: "Hamburg / Meet",
    notes: "Freigabe fuer Rahmenvertrag und SLA-Paket.",
    syncState: "synced",
    externalUpdatedAt: "2026-04-04T12:10:00.000Z",
  },
  {
    id: "appointment-2",
    ownerUserId: demoSession.user.id,
    customerId: "customer-2",
    title: "Onboarding Helios West",
    googleEventId: "google-demo-2",
    startsAt: "2026-04-08T13:30:00.000Z",
    endsAt: "2026-04-08T14:30:00.000Z",
    location: "Muenchen / Teams",
    notes: "Sync der Projektmeilensteine mit Finance und Sales.",
    syncState: "pending_push",
    externalUpdatedAt: "2026-04-03T09:02:00.000Z",
  },
];

export const documentItems: Record<string, DocumentLineItem[]> = {
  "document-1": [
    {
      id: "item-1",
      sortOrder: 1,
      sku: "SV-2026",
      description: "Jahreslizenz KlaroCRM Enterprise",
      qty: 1,
      unitNetCents: 1290000,
      taxRate: 19,
      lineNetCents: 1290000,
      lineTaxCents: 245100,
      lineGrossCents: 1535100,
    },
    {
      id: "item-2",
      sortOrder: 2,
      sku: "ONB-PLUS",
      description: "Einfuehrung, Datenmigration und Go-Live Support",
      qty: 1,
      unitNetCents: 570000,
      taxRate: 19,
      lineNetCents: 570000,
      lineTaxCents: 108300,
      lineGrossCents: 678300,
    },
  ],
};

export const documents: DocumentRecord[] = [
  {
    id: "document-1",
    kind: "invoice",
    status: "sent",
    customerId: "customer-1",
    sequenceNo: 1042,
    documentNo: "RE-2026-1042",
    issueDate: "2026-04-03",
    serviceDate: "2026-04-03",
    dueDate: "2026-04-17",
    currency: "EUR",
    taxMode: "standard",
    subtotalNetCents: 1860000,
    taxTotalCents: 353400,
    totalGrossCents: 2213400,
    paymentTerms: "14 Tage netto",
    legalFooter:
      "Leistungsdatum entspricht dem Rechnungsdatum. Zahlung ohne Abzug innerhalb von 14 Tagen.",
    einvoiceProfile: "EN16931-ready",
    einvoicePayload: {
      bt24: "RE-2026-1042",
      bt1: "380",
      bt5: "EUR",
      bt70: "DE318761245",
    },
    pdfPath: "documents/2026/RE-2026-1042/v2.pdf",
    createdBy: demoSession.user.id,
    updatedBy: demoSession.user.id,
    createdAt: "2026-04-03T08:00:00.000Z",
    updatedAt: "2026-04-05T07:45:00.000Z",
    versions: [
      {
        id: "version-1",
        storagePath: "documents/2026/RE-2026-1042/v1.pdf",
        sha256: "a4c94fa1bd3f5ac34bc4763a0e793926",
        generatedBy: demoSession.user.id,
        generatedAt: "2026-04-03T08:01:00.000Z",
      },
      {
        id: "version-2",
        storagePath: "documents/2026/RE-2026-1042/v2.pdf",
        sha256: "f2a5e079b3ab419ebce437ed8e73fa9a",
        generatedBy: demoSession.user.id,
        generatedAt: "2026-04-05T07:45:00.000Z",
      },
    ],
  },
];

export const auditLogs: AuditLogEntry[] = [
  {
    id: "audit-1",
    actorUserId: demoSession.user.id,
    entityType: "document",
    entityId: "document-1",
    action: "document.pdf_generated",
    diff: { version: "v2" },
    createdAt: "2026-04-05T07:45:00.000Z",
  },
  {
    id: "audit-2",
    actorUserId: demoSession.user.id,
    entityType: "deal",
    entityId: "deal-1",
    action: "deal.stage_changed",
    diff: { from: "proposal", to: "negotiation" },
    createdAt: "2026-04-04T14:10:00.000Z",
  },
  {
    id: "audit-3",
    actorUserId: demoSession.user.id,
    entityType: "calendar",
    entityId: "appointment-1",
    action: "calendar.sync_completed",
    diff: { source: "google" },
    createdAt: "2026-04-04T12:11:00.000Z",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Aktive Pipeline",
    value: "53.0k EUR",
    detail: "3 Deals im Fokus",
    trend: "+12.4%",
    tone: "primary",
  },
  {
    label: "Dokumente offen",
    value: "7",
    detail: "2 Rechnungen faellig",
    trend: "-1 heute",
    tone: "warning",
  },
  {
    label: "Sync Health",
    value: "98.6%",
    detail: "Google Watch aktiv",
    trend: "+0.8%",
    tone: "accent",
  },
  {
    label: "Kundenbindung",
    value: "81",
    detail: "Weighted health score",
    trend: "+6.2%",
    tone: "primary",
  },
];

export const calendarConnection: CalendarConnection = {
  userId: demoSession.user.id,
  googleEmail: demoSession.user.email,
  accessScope: "calendar.events calendar.readonly",
  status: "connected",
  lastSyncedAt: "2026-04-05T07:44:00.000Z",
  syncToken: "demo-next-sync-token",
  tokenExpiresAt: "2026-04-05T08:44:00.000Z",
};

export function getCustomerById(customerId: string) {
  return customers.find((customer) => customer.id === customerId);
}

export function getContactsByCustomerId(customerId: string) {
  return contacts.filter((contact) => contact.customerId === customerId);
}

export function getDocumentSnapshot(
  documentId: string,
): DocumentSnapshot | null {
  const document = documents.find((entry) => entry.id === documentId);

  if (!document) {
    return null;
  }

  const customer = getCustomerById(document.customerId);

  if (!customer) {
    return null;
  }

  return {
    company: companyProfile,
    customer,
    document,
    items: documentItems[document.id] ?? [],
  };
}
