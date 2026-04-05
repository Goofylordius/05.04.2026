"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logAuditEvent } from "@/lib/audit/log";
import { requireSessionContext } from "@/lib/auth/session";
import {
  parseAppointmentForm,
  parseCompanyProfileForm,
  parseContactForm,
  parseCustomerForm,
  parseDealForm,
} from "@/lib/crm/forms";
import { isSupabaseConfigured } from "@/lib/env";
import {
  pushAppointmentToGoogle,
  syncGoogleCalendarForUser,
} from "@/lib/google-calendar/sync";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safePath(value: FormDataEntryValue | null, fallback: string) {
  const path = typeof value === "string" ? value : fallback;
  return path.startsWith("/") ? path : fallback;
}

function actionErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unbekannter Fehler.";
}

function buildRedirect(
  path: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function saveCompanyProfileAction(formData: FormData) {
  await requireSessionContext("company.manage");

  if (!isSupabaseConfigured()) {
    redirect(
      "/settings/company?message=Demo-Modus%3A%20Unternehmensprofil%20wird%20nicht%20persistiert",
    );
  }

  try {
    const input = parseCompanyProfileForm(formData);
    const supabase = await createServerSupabaseClient();
    const { data: existing, error: selectError } = await supabase
      .from("company_profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("company_profile")
        .update({
          legal_name: input.legalName,
          vat_id: input.vatId,
          tax_number: input.taxNumber,
          invoice_email: input.invoiceEmail,
          iban: input.iban,
          bic: input.bic,
          invoice_footer: input.invoiceFooter,
          billing_address: input.billingAddress,
        })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase.from("company_profile").insert({
        legal_name: input.legalName,
        vat_id: input.vatId,
        tax_number: input.taxNumber,
        invoice_email: input.invoiceEmail,
        iban: input.iban,
        bic: input.bic,
        invoice_footer: input.invoiceFooter,
        billing_address: input.billingAddress,
      });

      if (error) {
        throw error;
      }
    }

    revalidatePath("/settings/company");
    redirect(
      "/settings/company?message=Unternehmensprofil%20wurde%20aktualisiert",
    );
  } catch (error) {
    redirect(
      buildRedirect("/settings/company", {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function createCustomerAction(formData: FormData) {
  const session = await requireSessionContext("crm.manage");

  if (!isSupabaseConfigured()) {
    redirect(
      "/crm/customers/new?message=Demo-Modus%3A%20Kundenanlage%20wird%20nicht%20persistiert",
    );
  }

  try {
    const input = parseCustomerForm(formData);
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        type: input.type,
        company_name: input.companyName,
        vat_id: input.vatId ?? null,
        email: input.email,
        phone: input.phone,
        industry: input.industry,
        billing_address: input.billingAddress,
        shipping_address: input.shippingAddress ?? null,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Kunde konnte nicht angelegt werden.");
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "customer",
      entityId: String(data.id),
      action: "customer.created",
      diff: {
        companyName: input.companyName,
        type: input.type,
      },
    });

    revalidatePath("/crm/customers");
    redirect(
      buildRedirect(`/crm/customers/${data.id}`, {
        message: "Kunde wurde angelegt",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect("/crm/customers/new", {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function updateCustomerAction(formData: FormData) {
  const session = await requireSessionContext("crm.manage");
  const customerId = String(formData.get("customerId") ?? "");

  if (!customerId) {
    redirect("/crm/customers?error=Kunde%20nicht%20gefunden");
  }

  if (!isSupabaseConfigured()) {
    redirect(
      buildRedirect(`/crm/customers/${customerId}`, {
        message: "Demo-Modus: Kundenaenderungen werden nicht persistiert",
      }),
    );
  }

  try {
    const input = parseCustomerForm(formData);
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("customers")
      .update({
        type: input.type,
        company_name: input.companyName,
        vat_id: input.vatId ?? null,
        email: input.email,
        phone: input.phone,
        industry: input.industry,
        billing_address: input.billingAddress,
        shipping_address: input.shippingAddress ?? null,
      })
      .eq("id", customerId);

    if (error) {
      throw error;
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "customer",
      entityId: customerId,
      action: "customer.updated",
      diff: {
        companyName: input.companyName,
        industry: input.industry,
      },
    });

    revalidatePath("/crm/customers");
    revalidatePath(`/crm/customers/${customerId}`);
    redirect(
      buildRedirect(`/crm/customers/${customerId}`, {
        message: "Kundendaten wurden aktualisiert",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect(`/crm/customers/${customerId}`, {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function createContactAction(formData: FormData) {
  const session = await requireSessionContext("crm.manage");

  try {
    const input = parseContactForm(formData);

    if (!isSupabaseConfigured()) {
      redirect(
        buildRedirect(`/crm/customers/${input.customerId}`, {
          message:
            "Demo-Modus: Ansprechpartner werden nicht persistent gespeichert",
        }),
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        customer_id: input.customerId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        job_title: input.jobTitle,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Ansprechpartner konnte nicht angelegt werden.");
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "contact",
      entityId: String(data.id),
      action: "contact.created",
      diff: {
        customerId: input.customerId,
        fullName: `${input.firstName} ${input.lastName}`,
      },
    });

    revalidatePath(`/crm/customers/${input.customerId}`);
    redirect(
      buildRedirect(`/crm/customers/${input.customerId}`, {
        message: "Ansprechpartner wurde angelegt",
      }),
    );
  } catch (error) {
    const customerId = String(formData.get("customerId") ?? "");
    const fallback = customerId
      ? `/crm/customers/${customerId}`
      : "/crm/customers";

    redirect(
      buildRedirect(fallback, {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function createDealAction(formData: FormData) {
  const session = await requireSessionContext("crm.manage");

  if (!isSupabaseConfigured()) {
    redirect(
      "/crm/deals/new?message=Demo-Modus%3A%20Deals%20werden%20nicht%20persistiert",
    );
  }

  try {
    const input = parseDealForm(formData);
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("deals")
      .insert({
        customer_id: input.customerId,
        owner_user_id: session.user.id,
        title: input.title,
        stage: input.stage,
        value_cents: input.valueCents,
        probability: input.probability,
        expected_close_date: input.expectedCloseDate,
        notes: input.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Deal konnte nicht angelegt werden.");
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "deal",
      entityId: String(data.id),
      action: "deal.created",
      diff: {
        stage: input.stage,
        valueCents: input.valueCents,
      },
    });

    revalidatePath("/crm/deals");
    redirect(
      buildRedirect(`/crm/deals/${data.id}`, {
        message: "Deal wurde angelegt",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect("/crm/deals/new", {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function updateDealAction(formData: FormData) {
  const session = await requireSessionContext("crm.manage");
  const dealId = String(formData.get("dealId") ?? "");

  if (!dealId) {
    redirect("/crm/deals?error=Deal%20nicht%20gefunden");
  }

  if (!isSupabaseConfigured()) {
    redirect(
      buildRedirect(`/crm/deals/${dealId}`, {
        message: "Demo-Modus: Deal-Aenderungen werden nicht persistiert",
      }),
    );
  }

  try {
    const input = parseDealForm(formData);
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("deals")
      .update({
        customer_id: input.customerId,
        title: input.title,
        stage: input.stage,
        value_cents: input.valueCents,
        probability: input.probability,
        expected_close_date: input.expectedCloseDate,
        notes: input.notes ?? null,
      })
      .eq("id", dealId);

    if (error) {
      throw error;
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "deal",
      entityId: dealId,
      action: "deal.updated",
      diff: {
        stage: input.stage,
        probability: input.probability,
      },
    });

    revalidatePath("/crm/deals");
    revalidatePath(`/crm/deals/${dealId}`);
    redirect(
      buildRedirect(`/crm/deals/${dealId}`, {
        message: "Deal wurde aktualisiert",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect(`/crm/deals/${dealId}`, {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function createAppointmentAction(formData: FormData) {
  const session = await requireSessionContext("calendar.manage");
  const fallbackPath = safePath(formData.get("redirectTo"), "/calendar");

  try {
    const input = parseAppointmentForm(formData);

    if (!isSupabaseConfigured()) {
      redirect(
        buildRedirect(fallbackPath, {
          message: "Demo-Modus: Termine werden nicht persistent gespeichert",
        }),
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        owner_user_id: session.user.id,
        customer_id: input.customerId ?? null,
        title: input.title,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        location: input.location ?? null,
        notes: input.notes ?? null,
        sync_state: input.syncToGoogle ? "pending_push" : "disconnected",
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Termin konnte nicht angelegt werden.");
    }

    let message = "Termin wurde angelegt";

    if (input.syncToGoogle) {
      try {
        const syncResult = await pushAppointmentToGoogle(
          session.user.id,
          String(data.id),
        );

        if (syncResult.synced) {
          message = "Termin wurde angelegt und mit Google synchronisiert";
        } else if (syncResult.reason) {
          message = `Termin lokal angelegt. ${syncResult.reason}`;
        }
      } catch (syncError) {
        message = `Termin lokal angelegt. ${actionErrorMessage(syncError)}`;
      }
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "appointment",
      entityId: String(data.id),
      action: "appointment.created",
      diff: {
        customerId: input.customerId ?? null,
        syncToGoogle: input.syncToGoogle,
      },
    });

    revalidatePath("/calendar");
    redirect(
      buildRedirect(fallbackPath, {
        message,
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect(fallbackPath, {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function syncCalendarNowAction(formData: FormData) {
  const session = await requireSessionContext("calendar.manage");
  const fallbackPath = safePath(formData.get("redirectTo"), "/calendar");

  if (!isSupabaseConfigured()) {
    redirect(
      buildRedirect(fallbackPath, {
        message: "Demo-Modus: Kalender-Sync wird simuliert",
      }),
    );
  }

  try {
    const result = await syncGoogleCalendarForUser(session.user.id);

    revalidatePath("/calendar");
    redirect(
      buildRedirect(fallbackPath, {
        message: `${result.syncedCount} Termine wurden synchronisiert`,
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect(fallbackPath, {
        error: actionErrorMessage(error),
      }),
    );
  }
}
