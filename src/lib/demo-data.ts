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
  {
    id: "contact-4",
    customerId: "customer-2",
    firstName: "Rene",
    lastName: "Hartung",
    email: "rene.hartung@helios.example",
    phone: "+49 89 3051 31",
    jobTitle: "Finance Director",
  },
  {
    id: "contact-5",
    customerId: "customer-3",
    firstName: "Julia",
    lastName: "Mertens",
    email: "julia.mertens@werkform.example",
    phone: "+49 211 8841 15",
    jobTitle: "Projektleitung Ausbau",
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
    notes: "Rahmenvertrag inklusive SLA, Hosting und Schulungspaket.",
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
    notes: "Angebot liegt bei Vorstand und Finance zur Freigabe.",
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
    notes: "Kunde will Staffelpreise fuer drei Niederlassungen.",
    updatedAt: "2026-04-03T11:08:00.000Z",
  },
  {
    id: "deal-4",
    customerId: "customer-1",
    ownerUserId: demoSession.user.id,
    title: "Field-Service Modul Nordlicht",
    stage: "lead",
    valueCents: 620000,
    probability: 22,
    expectedCloseDate: "2026-06-02",
    notes: "Discovery-Termin geplant, noch keine Budgetfreigabe.",
    updatedAt: "2026-04-02T09:30:00.000Z",
  },
  {
    id: "deal-5",
    customerId: "customer-2",
    ownerUserId: demoSession.user.id,
    title: "Renewal Analytics Paket",
    stage: "won",
    valueCents: 1290000,
    probability: 100,
    expectedCloseDate: "2026-03-29",
    notes: "Abgeschlossen, Start in KW15.",
    updatedAt: "2026-03-29T16:22:00.000Z",
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
  {
    id: "appointment-3",
    ownerUserId: demoSession.user.id,
    customerId: "customer-3",
    title: "Vor-Ort Termin WerkForm",
    googleEventId: "google-demo-3",
    startsAt: "2026-04-10T08:00:00.000Z",
    endsAt: "2026-04-10T10:00:00.000Z",
    location: "Duesseldorf / Showroom",
    notes: "Abgleich der Angebotspositionen mit Bauleitung.",
    syncState: "synced",
    externalUpdatedAt: "2026-04-05T06:35:00.000Z",
  },
  {
    id: "appointment-4",
    ownerUserId: demoSession.user.id,
    customerId: "customer-1",
    title: "QBR Nordlicht",
    startsAt: "2026-04-15T12:00:00.000Z",
    endsAt: "2026-04-15T13:00:00.000Z",
    location: "Remote",
    notes: "Quartalsreview mit Operations und Einkauf.",
    syncState: "disconnected",
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
  "document-2": [
    {
      id: "item-3",
      sortOrder: 1,
      sku: "ROLL-WS",
      description: "Workshop fuer CRM Rollout Westregion",
      qty: 2,
      unitNetCents: 420000,
      taxRate: 19,
      lineNetCents: 840000,
      lineTaxCents: 159600,
      lineGrossCents: 999600,
    },
    {
      id: "item-4",
      sortOrder: 2,
      sku: "MIG-DATA",
      description: "Datenmigration und Qualitaetssicherung",
      qty: 1,
      unitNetCents: 760000,
      taxRate: 19,
      lineNetCents: 760000,
      lineTaxCents: 144400,
      lineGrossCents: 904400,
    },
  ],
  "document-3": [
    {
      id: "item-5",
      sortOrder: 1,
      sku: "MAINT-Q2",
      description: "Serviceeinsatz und Rueckstandsbeseitigung",
      qty: 1,
      unitNetCents: 185000,
      taxRate: 19,
      lineNetCents: 185000,
      lineTaxCents: 35150,
      lineGrossCents: 220150,
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
  {
    id: "document-2",
    kind: "quote",
    status: "draft",
    customerId: "customer-2",
    sequenceNo: 311,
    documentNo: "AN-2026-0311",
    issueDate: "2026-04-05",
    serviceDate: "2026-04-15",
    dueDate: "2026-04-19",
    currency: "EUR",
    taxMode: "standard",
    subtotalNetCents: 1600000,
    taxTotalCents: 304000,
    totalGrossCents: 1904000,
    paymentTerms: "Gueltig 14 Tage",
    legalFooter:
      "Angebot freibleibend. Projektstart nach schriftlicher Freigabe.",
    einvoiceProfile: "EN16931-ready",
    einvoicePayload: {
      bt24: "AN-2026-0311",
      bt1: "220",
      bt5: "EUR",
      bt70: "DE318761245",
    },
    createdBy: demoSession.user.id,
    updatedBy: demoSession.user.id,
    createdAt: "2026-04-05T09:10:00.000Z",
    updatedAt: "2026-04-05T09:10:00.000Z",
    versions: [],
  },
  {
    id: "document-3",
    kind: "invoice",
    status: "overdue",
    customerId: "customer-3",
    sequenceNo: 1043,
    documentNo: "RE-2026-1043",
    issueDate: "2026-03-19",
    serviceDate: "2026-03-19",
    dueDate: "2026-04-02",
    currency: "EUR",
    taxMode: "standard",
    subtotalNetCents: 185000,
    taxTotalCents: 35150,
    totalGrossCents: 220150,
    paymentTerms: "14 Tage netto",
    legalFooter:
      "Bitte unter Angabe der Rechnungsnummer innerhalb von 14 Tagen zahlen.",
    einvoiceProfile: "EN16931-ready",
    einvoicePayload: {
      bt24: "RE-2026-1043",
      bt1: "380",
      bt5: "EUR",
      bt70: "DE318761245",
    },
    pdfPath: "documents/2026/RE-2026-1043/v1.pdf",
    createdBy: demoSession.user.id,
    updatedBy: demoSession.user.id,
    createdAt: "2026-03-19T08:30:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z",
    versions: [
      {
        id: "version-3",
        storagePath: "documents/2026/RE-2026-1043/v1.pdf",
        sha256: "9dc0a3d8c8b74b8abed574ff501f8221",
        generatedBy: demoSession.user.id,
        generatedAt: "2026-03-19T08:31:00.000Z",
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
  {
    id: "audit-4",
    actorUserId: demoSession.user.id,
    entityType: "document",
    entityId: "document-2",
    action: "document.created",
    diff: { kind: "quote", status: "draft" },
    createdAt: "2026-04-05T09:10:00.000Z",
  },
  {
    id: "audit-5",
    actorUserId: demoSession.user.id,
    entityType: "deal",
    entityId: "deal-5",
    action: "deal.closed_won",
    diff: { valueCents: 1290000 },
    createdAt: "2026-03-29T16:22:00.000Z",
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

export function getDealById(dealId: string) {
  return deals.find((deal) => deal.id === dealId);
}

export function getDealsByCustomerId(customerId: string) {
  return deals.filter((deal) => deal.customerId === customerId);
}

export function getAppointmentsByCustomerId(customerId: string) {
  return appointments.filter(
    (appointment) => appointment.customerId === customerId,
  );
}

export function getDocumentsByCustomerId(customerId: string) {
  return documents.filter((document) => document.customerId === customerId);
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
