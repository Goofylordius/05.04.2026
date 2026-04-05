import {
  auditLogs,
  calendarConnection,
  companyProfile,
  contacts,
  customers,
  deals,
  appointments,
  dashboardMetrics,
  documents,
  getAppointmentsByCustomerId,
  getContactsByCustomerId,
  getCustomerById,
  getDealById,
  getDealsByCustomerId,
  getDocumentSnapshot,
  getDocumentsByCustomerId,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Address,
  Appointment,
  AuditLogEntry,
  CalendarConnection,
  CompanyProfile,
  Contact,
  Customer,
  Deal,
  DashboardMetric,
  DocumentLineItem,
  DocumentSnapshot,
} from "@/lib/types";

type LiveRow = Record<string, unknown>;

async function withLiveFallback<T>(loader: () => Promise<T>, fallback: T) {
  if (!isSupabaseConfigured()) {
    return fallback;
  }

  try {
    return await loader();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Falling back to demo data", error);
    }

    return fallback;
  }
}

function mapAddress(value: unknown): Address {
  const payload = typeof value === "object" && value !== null ? value : {};
  const address = payload as Record<string, unknown>;

  return {
    line1: String(address.line1 ?? ""),
    line2: address.line2 ? String(address.line2) : undefined,
    postalCode: String(address.postalCode ?? address.postal_code ?? ""),
    city: String(address.city ?? ""),
    country: String(address.country ?? "Deutschland"),
  };
}

function mapCustomer(row: LiveRow): Customer {
  return {
    id: String(row.id),
    type: String(row.type) === "person" ? "person" : "company",
    companyName: String(row.company_name ?? ""),
    vatId: row.vat_id ? String(row.vat_id) : undefined,
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    billingAddress: mapAddress(row.billing_address),
    shippingAddress: row.shipping_address
      ? mapAddress(row.shipping_address)
      : undefined,
    industry: String(row.industry ?? "Allgemein"),
    ownerUserId: String(row.created_by ?? ""),
    healthScore: Number(row.health_score ?? 70),
  };
}

function mapContact(row: LiveRow): Contact {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    jobTitle: String(row.job_title ?? ""),
  };
}

function mapDeal(row: LiveRow): Deal {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    ownerUserId: String(row.owner_user_id ?? ""),
    title: String(row.title ?? ""),
    stage:
      row.stage === "lead" ||
      row.stage === "qualified" ||
      row.stage === "proposal" ||
      row.stage === "negotiation" ||
      row.stage === "won" ||
      row.stage === "lost"
        ? row.stage
        : "lead",
    valueCents: Number(row.value_cents ?? 0),
    probability: Number(row.probability ?? 0),
    expectedCloseDate: String(row.expected_close_date ?? ""),
    notes: row.notes ? String(row.notes) : undefined,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapAppointment(row: LiveRow): Appointment {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id ?? ""),
    customerId: row.customer_id ? String(row.customer_id) : undefined,
    title: String(row.title ?? row.summary ?? "Termin"),
    googleEventId: row.google_event_id
      ? String(row.google_event_id)
      : undefined,
    startsAt: String(row.starts_at ?? new Date().toISOString()),
    endsAt: String(row.ends_at ?? new Date().toISOString()),
    location: row.location ? String(row.location) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    syncState:
      row.sync_state === "pending_push" ||
      row.sync_state === "sync_error" ||
      row.sync_state === "disconnected"
        ? row.sync_state
        : "synced",
    externalUpdatedAt: row.external_updated_at
      ? String(row.external_updated_at)
      : undefined,
  };
}

function mapAuditLog(row: LiveRow): AuditLogEntry {
  return {
    id: String(row.id),
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : undefined,
    entityType: String(row.entity_type ?? ""),
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    action: String(row.action ?? ""),
    diff:
      typeof row.diff === "object" && row.diff !== null
        ? (row.diff as Record<string, unknown>)
        : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapCompany(row: LiveRow): CompanyProfile {
  return {
    id: String(row.id),
    legalName: String(row.legal_name ?? ""),
    vatId: String(row.vat_id ?? ""),
    taxNumber: String(row.tax_number ?? ""),
    iban: String(row.iban ?? ""),
    bic: String(row.bic ?? ""),
    invoiceEmail: String(row.invoice_email ?? ""),
    invoiceFooter: String(row.invoice_footer ?? ""),
    billingAddress: mapAddress(row.billing_address ?? {}),
  };
}

function mapDocumentItem(row: LiveRow): DocumentLineItem {
  return {
    id: String(row.id),
    sortOrder: Number(row.sort_order ?? 0),
    sku: row.sku ? String(row.sku) : undefined,
    description: String(row.description ?? ""),
    qty: Number(row.qty ?? 0),
    unitNetCents: Number(row.unit_net_cents ?? 0),
    taxRate: Number(row.tax_rate ?? 0),
    lineNetCents: Number(row.line_net_cents ?? 0),
    lineTaxCents: Number(row.line_tax_cents ?? 0),
    lineGrossCents: Number(row.line_gross_cents ?? 0),
  };
}

function mapDocument(row: LiveRow) {
  return {
    id: String(row.id),
    kind:
      row.kind === "quote" || row.kind === "credit_note" ? row.kind : "invoice",
    status:
      row.status === "draft" ||
      row.status === "sent" ||
      row.status === "accepted" ||
      row.status === "paid" ||
      row.status === "cancelled" ||
      row.status === "overdue"
        ? row.status
        : "draft",
    customerId: String(row.customer_id),
    sequenceNo: Number(row.sequence_no ?? 0),
    documentNo: String(row.document_no ?? ""),
    issueDate: String(row.issue_date ?? ""),
    serviceDate: row.service_date ? String(row.service_date) : undefined,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    currency: String(row.currency ?? "EUR"),
    taxMode: String(row.tax_mode ?? "standard"),
    subtotalNetCents: Number(row.subtotal_net_cents ?? 0),
    taxTotalCents: Number(row.tax_total_cents ?? 0),
    totalGrossCents: Number(row.total_gross_cents ?? 0),
    paymentTerms: String(row.payment_terms ?? ""),
    legalFooter: String(row.legal_footer ?? ""),
    einvoiceProfile: String(row.einvoice_profile ?? ""),
    einvoicePayload:
      typeof row.einvoice_payload === "object" && row.einvoice_payload !== null
        ? (row.einvoice_payload as Record<string, string>)
        : {},
    pdfPath: row.pdf_path ? String(row.pdf_path) : undefined,
    createdBy: String(row.created_by ?? ""),
    updatedBy: String(row.updated_by ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    versions: [],
  } satisfies DocumentSnapshot["document"];
}

export async function loadCompanyProfile() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("company_profile")
      .select("*")
      .single();

    if (error || !data) {
      throw error ?? new Error("No company profile found.");
    }

    return mapCompany(data as LiveRow);
  }, companyProfile);
}

export async function loadCustomers() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("company_name", { ascending: true });

    if (error || !data) {
      throw error ?? new Error("Unable to load customers.");
    }

    return (data as LiveRow[]).map(mapCustomer);
  }, customers);
}

export async function loadContacts(customerId?: string) {
  return withLiveFallback(
    async () => {
      const supabase = await createServerSupabaseClient();
      let query = supabase.from("contacts").select("*").order("last_name", {
        ascending: true,
      });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error || !data) {
        throw error ?? new Error("Unable to load contacts.");
      }

      return (data as LiveRow[]).map(mapContact);
    },
    customerId
      ? contacts.filter((contact) => contact.customerId === customerId)
      : contacts,
  );
}

export async function loadDeals() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("Unable to load deals.");
    }

    return (data as LiveRow[]).map(mapDeal);
  }, deals);
}

export async function loadDealById(dealId: string) {
  return withLiveFallback(
    async () => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .maybeSingle();

      if (error || !data) {
        throw error ?? new Error("Deal not found.");
      }

      return mapDeal(data as LiveRow);
    },
    getDealById(dealId) ?? null,
  );
}

export async function loadAppointments() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error || !data) {
      throw error ?? new Error("Unable to load appointments.");
    }

    return (data as LiveRow[]).map(mapAppointment);
  }, appointments);
}

export async function loadAuditLogs() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      throw error ?? new Error("Unable to load audit log.");
    }

    return (data as LiveRow[]).map(mapAuditLog);
  }, auditLogs);
}

export async function loadCustomerById(customerId: string) {
  return withLiveFallback(
    async () => {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();

      if (error || !data) {
        throw error ?? new Error("Customer not found.");
      }

      return mapCustomer(data as LiveRow);
    },
    getCustomerById(customerId) ?? null,
  );
}

export async function loadCalendarConnection(
  userId: string,
): Promise<CalendarConnection> {
  return withLiveFallback<CalendarConnection>(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("No calendar connection found.");
    }

    return {
      userId: String(data.user_id),
      googleEmail: data.google_email ? String(data.google_email) : undefined,
      accessScope: data.access_scope ? String(data.access_scope) : undefined,
      status:
        data.status === "connected" ||
        data.status === "disconnected" ||
        data.status === "error"
          ? data.status
          : "pending",
      lastSyncedAt: data.last_synced_at
        ? String(data.last_synced_at)
        : undefined,
      syncToken: data.sync_token ? String(data.sync_token) : undefined,
      tokenExpiresAt: data.token_expires_at
        ? String(data.token_expires_at)
        : undefined,
    } satisfies CalendarConnection;
  }, calendarConnection);
}

export async function loadDocuments() {
  return withLiveFallback(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("Unable to load documents.");
    }

    return (data as LiveRow[]).map(mapDocument);
  }, documents);
}

export async function loadDocumentSnapshot(
  documentId: string,
): Promise<DocumentSnapshot | null> {
  return withLiveFallback<DocumentSnapshot | null>(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: documentRow, error: documentError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (documentError || !documentRow) {
      throw documentError ?? new Error("Document not found.");
    }

    const [
      { data: customerRow },
      { data: itemRows },
      { data: versionRows },
      company,
    ] = await Promise.all([
      supabase
        .from("customers")
        .select("*")
        .eq("id", documentRow.customer_id)
        .single(),
      supabase
        .from("document_items")
        .select("*")
        .eq("document_id", documentId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("generated_at", { ascending: false }),
      loadCompanyProfile(),
    ]);

    if (!customerRow) {
      throw new Error("Related customer not found.");
    }

    return {
      company,
      customer: mapCustomer(customerRow as LiveRow),
      document: {
        ...mapDocument(documentRow as LiveRow),
        versions: ((versionRows ?? []) as LiveRow[]).map((row) => ({
          id: String(row.id),
          storagePath: String(row.storage_path ?? ""),
          sha256: String(row.sha256 ?? ""),
          generatedBy: row.generated_by ? String(row.generated_by) : undefined,
          generatedAt: String(row.generated_at ?? new Date().toISOString()),
        })),
      },
      items: ((itemRows ?? []) as LiveRow[]).map(mapDocumentItem),
    } satisfies DocumentSnapshot;
  }, getDocumentSnapshot(documentId));
}

export async function loadDashboardMetrics(): Promise<DashboardMetric[]> {
  return dashboardMetrics;
}

export async function loadCustomerWorkspace(customerId: string) {
  return withLiveFallback(
    async () => {
      const [
        customer,
        customerContacts,
        customerDeals,
        customerAppointments,
        customerDocuments,
      ] = await Promise.all([
        loadCustomerById(customerId),
        loadContacts(customerId),
        loadDeals(),
        loadAppointments(),
        loadDocuments(),
      ]);

      if (!customer) {
        throw new Error("Customer not found.");
      }

      return {
        customer,
        contacts: customerContacts,
        deals: customerDeals.filter((deal) => deal.customerId === customerId),
        appointments: customerAppointments.filter(
          (appointment) => appointment.customerId === customerId,
        ),
        documents: customerDocuments.filter(
          (document) => document.customerId === customerId,
        ),
      };
    },
    {
      customer: getCustomerById(customerId) ?? null,
      contacts: getContactsByCustomerId(customerId),
      deals: getDealsByCustomerId(customerId),
      appointments: getAppointmentsByCustomerId(customerId),
      documents: getDocumentsByCustomerId(customerId),
    },
  );
}
