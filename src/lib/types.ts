export type AppRole = "admin" | "sales" | "viewer";

export type Permission =
  | "dashboard.view"
  | "crm.view"
  | "crm.manage"
  | "documents.view"
  | "documents.manage"
  | "calendar.view"
  | "calendar.manage"
  | "company.manage"
  | "security.manage"
  | "users.manage"
  | "audit.view";

export type CustomerType = "company" | "person";
export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";
export type AppointmentSyncState =
  | "synced"
  | "pending_push"
  | "sync_error"
  | "disconnected";
export type DocumentKind = "quote" | "invoice" | "credit_note";
export type DocumentStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "paid"
  | "cancelled"
  | "overdue";

export type Address = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  avatarFallback: string;
};

export type SessionContext = {
  mode: "demo" | "live";
  user: SessionUser;
  role: AppRole;
  permissions: Permission[];
};

export type CompanyProfile = {
  id: string;
  legalName: string;
  vatId: string;
  taxNumber: string;
  iban: string;
  bic: string;
  invoiceEmail: string;
  invoiceFooter: string;
  billingAddress: Address;
};

export type Customer = {
  id: string;
  type: CustomerType;
  companyName: string;
  vatId?: string;
  email: string;
  phone: string;
  billingAddress: Address;
  shippingAddress?: Address;
  industry: string;
  ownerUserId: string;
  healthScore: number;
};

export type Contact = {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
};

export type Deal = {
  id: string;
  customerId: string;
  ownerUserId: string;
  title: string;
  stage: DealStage;
  valueCents: number;
  probability: number;
  expectedCloseDate: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  ownerUserId: string;
  customerId?: string;
  title: string;
  googleEventId?: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
  syncState: AppointmentSyncState;
  externalUpdatedAt?: string;
};

export type AuditLogEntry = {
  id: string;
  actorUserId?: string;
  entityType: string;
  entityId?: string;
  action: string;
  diff?: Record<string, unknown>;
  createdAt: string;
};

export type DocumentLineItem = {
  id: string;
  sortOrder: number;
  sku?: string;
  description: string;
  qty: number;
  unitNetCents: number;
  taxRate: number;
  lineNetCents: number;
  lineTaxCents: number;
  lineGrossCents: number;
};

export type DocumentVersion = {
  id: string;
  storagePath: string;
  sha256: string;
  generatedBy?: string;
  generatedAt: string;
};

export type DocumentRecord = {
  id: string;
  kind: DocumentKind;
  status: DocumentStatus;
  customerId: string;
  sequenceNo: number;
  documentNo: string;
  issueDate: string;
  serviceDate?: string;
  dueDate?: string;
  currency: string;
  taxMode: string;
  subtotalNetCents: number;
  taxTotalCents: number;
  totalGrossCents: number;
  paymentTerms: string;
  legalFooter: string;
  einvoiceProfile: string;
  einvoicePayload: Record<string, string>;
  pdfPath?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  versions: DocumentVersion[];
};

export type DocumentSnapshot = {
  company: CompanyProfile;
  customer: Customer;
  document: DocumentRecord;
  items: DocumentLineItem[];
};

export type CalendarConnection = {
  userId: string;
  googleEmail?: string;
  accessScope?: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSyncedAt?: string;
  syncToken?: string;
  tokenExpiresAt?: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: "primary" | "accent" | "warning";
};
