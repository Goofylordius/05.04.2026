import {
  auditLogs,
  calendarConnection,
  companyProfile,
  contacts,
  customers,
  deals,
  appointments,
  dashboardMetrics,
  getDocumentSnapshot,
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
        id: String(documentRow.id),
        kind:
          documentRow.kind === "quote" || documentRow.kind === "credit_note"
            ? documentRow.kind
            : "invoice",
        status:
          documentRow.status === "draft" ||
          documentRow.status === "sent" ||
          documentRow.status === "accepted" ||
          documentRow.status === "paid" ||
          documentRow.status === "cancelled" ||
          documentRow.status === "overdue"
            ? documentRow.status
            : "draft",
        customerId: String(documentRow.customer_id),
        sequenceNo: Number(documentRow.sequence_no ?? 0),
        documentNo: String(documentRow.document_no ?? ""),
        issueDate: String(documentRow.issue_date ?? ""),
        serviceDate: documentRow.service_date
          ? String(documentRow.service_date)
          : undefined,
        dueDate: documentRow.due_date
          ? String(documentRow.due_date)
          : undefined,
        currency: String(documentRow.currency ?? "EUR"),
        taxMode: String(documentRow.tax_mode ?? "standard"),
        subtotalNetCents: Number(documentRow.subtotal_net_cents ?? 0),
        taxTotalCents: Number(documentRow.tax_total_cents ?? 0),
        totalGrossCents: Number(documentRow.total_gross_cents ?? 0),
        paymentTerms: String(documentRow.payment_terms ?? ""),
        legalFooter: String(documentRow.legal_footer ?? ""),
        einvoiceProfile: String(documentRow.einvoice_profile ?? ""),
        einvoicePayload:
          typeof documentRow.einvoice_payload === "object" &&
          documentRow.einvoice_payload !== null
            ? (documentRow.einvoice_payload as Record<string, string>)
            : {},
        pdfPath: documentRow.pdf_path
          ? String(documentRow.pdf_path)
          : undefined,
        createdBy: String(documentRow.created_by ?? ""),
        updatedBy: String(documentRow.updated_by ?? ""),
        createdAt: String(documentRow.created_at ?? new Date().toISOString()),
        updatedAt: String(documentRow.updated_at ?? new Date().toISOString()),
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
