"use server";

import { randomUUID } from "node:crypto";

import { renderToBuffer } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logAuditEvent } from "@/lib/audit/log";
import { requireSessionContext } from "@/lib/auth/session";
import { parseDocumentDraftForm, parseDocumentStatus } from "@/lib/crm/forms";
import { loadDocumentSnapshot } from "@/lib/data";
import { hasServiceRoleConfig, isSupabaseConfigured } from "@/lib/env";
import {
  InvoicePdfDocument,
  QuotePdfDocument,
} from "@/lib/documents/templates/invoice-pdf";
import { validateDocumentSnapshot } from "@/lib/documents/validation";
import { sha256 } from "@/lib/security/encryption";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

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

export async function generateDocumentPdf(documentId: string) {
  const session = await requireSessionContext("documents.manage");
  const snapshot = await loadDocumentSnapshot(documentId);

  if (!snapshot) {
    throw new Error("Document snapshot not found.");
  }

  const validation = validateDocumentSnapshot(snapshot);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const versionNumber = snapshot.document.versions.length + 1;
  const storagePath = `documents/${new Date(snapshot.document.issueDate).getFullYear()}/${snapshot.document.documentNo}/v${versionNumber}.pdf`;
  const pdfComponent =
    snapshot.document.kind === "quote"
      ? QuotePdfDocument({ snapshot })
      : InvoicePdfDocument({ snapshot });

  const pdfBuffer = await renderToBuffer(pdfComponent);
  const digest = sha256(pdfBuffer);
  const versionId = randomUUID();

  if (hasServiceRoleConfig()) {
    const supabase = createServiceSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: versionError } = await supabase
      .from("document_versions")
      .insert({
        id: versionId,
        document_id: snapshot.document.id,
        storage_path: storagePath,
        sha256: digest,
        generated_by: session.user.id,
      });

    if (versionError) {
      throw versionError;
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        pdf_path: storagePath,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", snapshot.document.id);

    if (updateError) {
      throw updateError;
    }
  }

  await logAuditEvent({
    actorUserId: session.user.id,
    entityType: "document",
    entityId: snapshot.document.id,
    action: "document.pdf_generated",
    diff: {
      version: versionNumber,
      storagePath,
      sha256: digest,
    },
  });

  revalidatePath(`/documents/${documentId}`);

  return {
    versionId,
    storagePath,
  };
}

export async function createDocumentDraftAction(formData: FormData) {
  const session = await requireSessionContext("documents.manage");

  if (!isSupabaseConfigured()) {
    redirect(
      "/documents/new?message=Demo-Modus%3A%20Dokumententwuerfe%20werden%20nicht%20persistiert",
    );
  }

  try {
    const input = parseDocumentDraftForm(formData);
    const supabase = await createServerSupabaseClient();
    const { data: sequenceData, error: sequenceError } = await supabase.rpc(
      "next_document_number",
      {
        request_kind: input.kind,
        requested_issue_date: input.issueDate,
      },
    );

    if (sequenceError) {
      throw sequenceError;
    }

    const sequenceRow = Array.isArray(sequenceData)
      ? sequenceData[0]
      : sequenceData;

    if (!sequenceRow) {
      throw new Error("Dokumentnummer konnte nicht vergeben werden.");
    }

    const { data: documentRow, error: documentError } = await supabase
      .from("documents")
      .insert({
        kind: input.kind,
        status: input.status,
        customer_id: input.customerId,
        sequence_no: Number(sequenceRow.sequence_no),
        document_no: String(sequenceRow.document_no),
        issue_date: input.issueDate,
        service_date: input.serviceDate ?? null,
        due_date: input.dueDate ?? null,
        currency: "EUR",
        tax_mode: "standard",
        subtotal_net_cents: input.totals.subtotalNetCents,
        tax_total_cents: input.totals.taxTotalCents,
        total_gross_cents: input.totals.totalGrossCents,
        payment_terms: input.paymentTerms,
        legal_footer: input.legalFooter ?? "",
        einvoice_profile: "EN16931-ready",
        einvoice_payload: {
          bt1: input.kind === "quote" ? "220" : "380",
          bt5: "EUR",
        },
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select("id, document_no")
      .single();

    if (documentError || !documentRow) {
      throw (
        documentError ?? new Error("Dokument konnte nicht angelegt werden.")
      );
    }

    const { error: itemsError } = await supabase.from("document_items").insert(
      input.items.map((item) => ({
        document_id: documentRow.id,
        sort_order: item.sortOrder,
        sku: item.sku ?? null,
        description: item.description,
        qty: item.qty,
        unit_net_cents: item.unitNetCents,
        tax_rate: item.taxRate,
        line_net_cents: item.lineNetCents,
        line_tax_cents: item.lineTaxCents,
        line_gross_cents: item.lineGrossCents,
      })),
    );

    if (itemsError) {
      throw itemsError;
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "document",
      entityId: String(documentRow.id),
      action: "document.created",
      diff: {
        kind: input.kind,
        documentNo: documentRow.document_no,
        totalGrossCents: input.totals.totalGrossCents,
      },
    });

    revalidatePath("/documents");
    redirect(
      buildRedirect(`/documents/${documentRow.id}`, {
        message: "Dokumententwurf wurde angelegt",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect("/documents/new", {
        error: actionErrorMessage(error),
      }),
    );
  }
}

export async function updateDocumentStatusAction(formData: FormData) {
  const session = await requireSessionContext("documents.manage");
  const documentId = String(formData.get("documentId") ?? "");
  const redirectTo =
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : `/documents/${documentId}`;

  if (!documentId) {
    redirect("/documents?error=Dokument%20nicht%20gefunden");
  }

  if (!isSupabaseConfigured()) {
    redirect(
      buildRedirect(redirectTo, {
        message: "Demo-Modus: Dokumentstatus wird nicht persistiert",
      }),
    );
  }

  try {
    const status = parseDocumentStatus(
      String(formData.get("status") ?? "draft"),
    );
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("documents")
      .update({
        status,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (error) {
      throw error;
    }

    await logAuditEvent({
      actorUserId: session.user.id,
      entityType: "document",
      entityId: documentId,
      action: "document.status_updated",
      diff: { status },
    });

    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    redirect(
      buildRedirect(redirectTo, {
        message: "Dokumentstatus wurde aktualisiert",
      }),
    );
  } catch (error) {
    redirect(
      buildRedirect(redirectTo, {
        error: actionErrorMessage(error),
      }),
    );
  }
}
