"use server";

import { randomUUID } from "node:crypto";

import { renderToBuffer } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";

import { logAuditEvent } from "@/lib/audit/log";
import { requireSessionContext } from "@/lib/auth/session";
import { loadDocumentSnapshot } from "@/lib/data";
import { hasServiceRoleConfig } from "@/lib/env";
import {
  InvoicePdfDocument,
  QuotePdfDocument,
} from "@/lib/documents/templates/invoice-pdf";
import { validateDocumentSnapshot } from "@/lib/documents/validation";
import { sha256 } from "@/lib/security/encryption";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

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
