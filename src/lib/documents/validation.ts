import { z } from "zod";

import type { DocumentLineItem, DocumentSnapshot } from "@/lib/types";

const companySchema = z.object({
  legalName: z.string().min(1),
  vatId: z.string().min(1),
  iban: z.string().min(1),
  invoiceEmail: z.string().email(),
});

const customerSchema = z.object({
  companyName: z.string().min(1),
  billingAddress: z.object({
    line1: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
  }),
});

const documentSchema = z.object({
  documentNo: z.string().min(1),
  issueDate: z.string().min(1),
  currency: z.literal("EUR"),
  paymentTerms: z.string().min(1),
});

export function calculateDocumentTotals(items: DocumentLineItem[]) {
  return items.reduce(
    (accumulator, item) => {
      accumulator.net += item.lineNetCents;
      accumulator.tax += item.lineTaxCents;
      accumulator.gross += item.lineGrossCents;
      return accumulator;
    },
    { net: 0, tax: 0, gross: 0 },
  );
}

export function validateDocumentSnapshot(snapshot: DocumentSnapshot) {
  const errors: string[] = [];

  const companyResult = companySchema.safeParse(snapshot.company);
  if (!companyResult.success) {
    errors.push("Unternehmensprofil ist unvollstaendig.");
  }

  const customerResult = customerSchema.safeParse(snapshot.customer);
  if (!customerResult.success) {
    errors.push("Kundenstammdaten sind unvollstaendig.");
  }

  const documentResult = documentSchema.safeParse(snapshot.document);
  if (!documentResult.success) {
    errors.push("Rechnungsmetadaten sind unvollstaendig.");
  }

  if (snapshot.items.length === 0) {
    errors.push("Mindestens eine Dokumentposition ist erforderlich.");
  }

  const totals = calculateDocumentTotals(snapshot.items);

  if (totals.net !== snapshot.document.subtotalNetCents) {
    errors.push("Netto-Summe stimmt nicht mit den Positionen ueberein.");
  }

  if (totals.tax !== snapshot.document.taxTotalCents) {
    errors.push("Steuer-Summe stimmt nicht mit den Positionen ueberein.");
  }

  if (totals.gross !== snapshot.document.totalGrossCents) {
    errors.push("Brutto-Summe stimmt nicht mit den Positionen ueberein.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
