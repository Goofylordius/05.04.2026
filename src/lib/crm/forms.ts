import type {
  Address,
  DealStage,
  DocumentKind,
  DocumentStatus,
} from "@/lib/types";

type CustomerFormInput = {
  type: "company" | "person";
  companyName: string;
  vatId?: string;
  email: string;
  phone: string;
  industry: string;
  billingAddress: Address;
  shippingAddress?: Address;
};

type ContactFormInput = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
};

type DealFormInput = {
  customerId: string;
  title: string;
  stage: DealStage;
  valueCents: number;
  probability: number;
  expectedCloseDate: string;
  notes?: string;
};

type AppointmentFormInput = {
  customerId?: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
  syncToGoogle: boolean;
};

type CompanyProfileInput = {
  legalName: string;
  vatId: string;
  taxNumber: string;
  invoiceEmail: string;
  iban: string;
  bic: string;
  invoiceFooter: string;
  billingAddress: Address;
};

type DocumentDraftItemInput = {
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

type DocumentDraftInput = {
  customerId: string;
  kind: DocumentKind;
  issueDate: string;
  serviceDate?: string;
  dueDate?: string;
  paymentTerms: string;
  legalFooter?: string;
  status: DocumentStatus;
  items: DocumentDraftItemInput[];
  totals: {
    subtotalNetCents: number;
    taxTotalCents: number;
    totalGrossCents: number;
  };
};

function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${label} ist erforderlich.`);
  }

  return value;
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function requiredDate(formData: FormData, key: string, label: string) {
  const value = requiredText(formData, key, label);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} muss als Datum im Format JJJJ-MM-TT vorliegen.`);
  }

  return value;
}

function optionalDate(formData: FormData, key: string, label: string) {
  const value = optionalText(formData, key);

  if (!value) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} muss als Datum im Format JJJJ-MM-TT vorliegen.`);
  }

  return value;
}

function parseNumber(value: string, label: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return parsed;
}

function parseEuroToCents(value: string, label: string) {
  const parsed = parseNumber(value, label);

  if (parsed < 0) {
    throw new Error(`${label} darf nicht negativ sein.`);
  }

  return Math.round(parsed * 100);
}

function parseIntegerInRange(
  value: string,
  label: string,
  minimum: number,
  maximum: number,
) {
  const parsed = Math.round(parseNumber(value, label));

  if (parsed < minimum || parsed > maximum) {
    throw new Error(`${label} muss zwischen ${minimum} und ${maximum} liegen.`);
  }

  return parsed;
}

function parseAddress(
  formData: FormData,
  prefix: string,
  label: string,
  required: boolean,
) {
  const line1 = optionalText(formData, `${prefix}Line1`);
  const line2 = optionalText(formData, `${prefix}Line2`);
  const postalCode = optionalText(formData, `${prefix}PostalCode`);
  const city = optionalText(formData, `${prefix}City`);
  const country = optionalText(formData, `${prefix}Country`) ?? "Deutschland";

  const hasAnyValue = Boolean(line1 || line2 || postalCode || city);

  if (!hasAnyValue && !required) {
    return undefined;
  }

  if (!line1 || !postalCode || !city) {
    throw new Error(`${label} ist nicht vollstaendig.`);
  }

  return {
    line1,
    line2,
    postalCode,
    city,
    country,
  } satisfies Address;
}

function parseDealStage(value: string): DealStage {
  if (
    value === "lead" ||
    value === "qualified" ||
    value === "proposal" ||
    value === "negotiation" ||
    value === "won" ||
    value === "lost"
  ) {
    return value;
  }

  throw new Error("Deal-Stage ist ungueltig.");
}

function parseDocumentKind(value: string): DocumentKind {
  if (value === "quote" || value === "invoice" || value === "credit_note") {
    return value;
  }

  throw new Error("Dokumenttyp ist ungueltig.");
}

export function parseDocumentStatus(value: string): DocumentStatus {
  if (
    value === "draft" ||
    value === "sent" ||
    value === "accepted" ||
    value === "paid" ||
    value === "cancelled" ||
    value === "overdue"
  ) {
    return value;
  }

  throw new Error("Dokumentstatus ist ungueltig.");
}

export function parseCompanyProfileForm(
  formData: FormData,
): CompanyProfileInput {
  const billingAddress = parseAddress(
    formData,
    "billing",
    "Rechnungsadresse",
    true,
  );

  if (!billingAddress) {
    throw new Error("Rechnungsadresse ist erforderlich.");
  }

  return {
    legalName: requiredText(formData, "legalName", "Firmenname"),
    vatId: requiredText(formData, "vatId", "USt-IdNr."),
    taxNumber: requiredText(formData, "taxNumber", "Steuernummer"),
    invoiceEmail: requiredText(formData, "invoiceEmail", "Rechnungs-E-Mail"),
    iban: requiredText(formData, "iban", "IBAN"),
    bic: requiredText(formData, "bic", "BIC"),
    invoiceFooter: requiredText(formData, "invoiceFooter", "Rechnungsfooter"),
    billingAddress,
  };
}

export function parseCustomerForm(formData: FormData): CustomerFormInput {
  const type = String(formData.get("type") ?? "company");
  const billingAddress = parseAddress(
    formData,
    "billing",
    "Rechnungsadresse",
    true,
  );

  if (!billingAddress) {
    throw new Error("Rechnungsadresse ist erforderlich.");
  }

  return {
    type: type === "person" ? "person" : "company",
    companyName: requiredText(formData, "companyName", "Kundenname"),
    vatId: optionalText(formData, "vatId"),
    email: requiredText(formData, "email", "E-Mail"),
    phone: requiredText(formData, "phone", "Telefon"),
    industry: requiredText(formData, "industry", "Branche"),
    billingAddress,
    shippingAddress: parseAddress(formData, "shipping", "Lieferadresse", false),
  };
}

export function parseContactForm(formData: FormData): ContactFormInput {
  return {
    customerId: requiredText(formData, "customerId", "Kunde"),
    firstName: requiredText(formData, "firstName", "Vorname"),
    lastName: requiredText(formData, "lastName", "Nachname"),
    email: requiredText(formData, "email", "E-Mail"),
    phone: requiredText(formData, "phone", "Telefon"),
    jobTitle: requiredText(formData, "jobTitle", "Rolle"),
  };
}

export function parseDealForm(formData: FormData): DealFormInput {
  return {
    customerId: requiredText(formData, "customerId", "Kunde"),
    title: requiredText(formData, "title", "Deal-Name"),
    stage: parseDealStage(String(formData.get("stage") ?? "lead")),
    valueCents: parseEuroToCents(
      requiredText(formData, "valueEuros", "Deal-Wert"),
      "Deal-Wert",
    ),
    probability: parseIntegerInRange(
      requiredText(formData, "probability", "Win-Rate"),
      "Win-Rate",
      0,
      100,
    ),
    expectedCloseDate: requiredDate(
      formData,
      "expectedCloseDate",
      "Close Date",
    ),
    notes: optionalText(formData, "notes"),
  };
}

export function parseAppointmentForm(formData: FormData): AppointmentFormInput {
  const startsAt = requiredText(formData, "startsAt", "Start");
  const endsAt = requiredText(formData, "endsAt", "Ende");
  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(endsAt);

  if (
    Number.isNaN(startsAtDate.getTime()) ||
    Number.isNaN(endsAtDate.getTime())
  ) {
    throw new Error("Start und Ende muessen gueltige Datumswerte sein.");
  }

  if (startsAtDate.getTime() >= endsAtDate.getTime()) {
    throw new Error("Das Terminende muss nach dem Start liegen.");
  }

  return {
    customerId: optionalText(formData, "customerId"),
    title: requiredText(formData, "title", "Terminname"),
    startsAt: startsAtDate.toISOString(),
    endsAt: endsAtDate.toISOString(),
    location: optionalText(formData, "location"),
    notes: optionalText(formData, "notes"),
    syncToGoogle: String(formData.get("syncToGoogle") ?? "") === "on",
  };
}

function parseDocumentItems(formData: FormData): DocumentDraftItemInput[] {
  const descriptions = formData.getAll("itemDescription");
  const qtyValues = formData.getAll("itemQty");
  const unitValues = formData.getAll("itemUnitNet");
  const taxValues = formData.getAll("itemTaxRate");
  const skuValues = formData.getAll("itemSku");

  const items: DocumentDraftItemInput[] = [];

  descriptions.forEach((entry, index) => {
    const description = String(entry ?? "").trim();
    const qtyValue = String(qtyValues[index] ?? "").trim();
    const unitValue = String(unitValues[index] ?? "").trim();
    const taxValue = String(taxValues[index] ?? "19").trim();
    const sku = String(skuValues[index] ?? "").trim();

    if (!description && !qtyValue && !unitValue && !sku) {
      return;
    }

    if (!description) {
      throw new Error(`Positionsbeschreibung ${index + 1} ist erforderlich.`);
    }

    const qty = parseNumber(qtyValue || "1", `Menge Position ${index + 1}`);
    const unitNetCents = parseEuroToCents(
      unitValue || "0",
      `Einzelpreis Position ${index + 1}`,
    );
    const taxRate = parseNumber(
      taxValue || "19",
      `Steuersatz Position ${index + 1}`,
    );

    if (taxRate < 0) {
      throw new Error(
        `Steuersatz Position ${index + 1} darf nicht negativ sein.`,
      );
    }

    const lineNetCents = Math.round(qty * unitNetCents);
    const lineTaxCents = Math.round(lineNetCents * (taxRate / 100));

    items.push({
      sortOrder: index + 1,
      sku: sku || undefined,
      description,
      qty,
      unitNetCents,
      taxRate,
      lineNetCents,
      lineTaxCents,
      lineGrossCents: lineNetCents + lineTaxCents,
    });
  });

  if (items.length === 0) {
    throw new Error("Mindestens eine Dokumentposition ist erforderlich.");
  }

  return items;
}

export function parseDocumentDraftForm(formData: FormData): DocumentDraftInput {
  const items = parseDocumentItems(formData);
  const subtotalNetCents = items.reduce(
    (sum, item) => sum + item.lineNetCents,
    0,
  );
  const taxTotalCents = items.reduce((sum, item) => sum + item.lineTaxCents, 0);

  return {
    customerId: requiredText(formData, "customerId", "Kunde"),
    kind: parseDocumentKind(String(formData.get("kind") ?? "quote")),
    issueDate: requiredDate(formData, "issueDate", "Belegdatum"),
    serviceDate: optionalDate(formData, "serviceDate", "Leistungsdatum"),
    dueDate: optionalDate(formData, "dueDate", "Faelligkeit"),
    paymentTerms: requiredText(formData, "paymentTerms", "Zahlungsziel"),
    legalFooter: optionalText(formData, "legalFooter"),
    status: parseDocumentStatus(String(formData.get("status") ?? "draft")),
    items,
    totals: {
      subtotalNetCents,
      taxTotalCents,
      totalGrossCents: subtotalNetCents + taxTotalCents,
    },
  };
}

export type {
  AppointmentFormInput,
  CompanyProfileInput,
  ContactFormInput,
  CustomerFormInput,
  DealFormInput,
  DocumentDraftInput,
};
