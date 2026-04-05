import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { DocumentSnapshot } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 10,
    padding: 40,
    fontFamily: "Helvetica",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  section: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 10,
  },
  panel: {
    border: "1 solid #d1d5db",
    borderRadius: 10,
    padding: 14,
  },
  label: {
    color: "#6b7280",
    fontSize: 8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 9,
    fontWeight: 600,
  },
  tableRow: {
    borderBottom: "1 solid #e5e7eb",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  small: {
    fontSize: 8,
    color: "#6b7280",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
});

function formatMoney(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100);
}

type PdfTemplateProps = {
  snapshot: DocumentSnapshot;
  title: string;
};

function PdfTemplate({ snapshot, title }: PdfTemplateProps) {
  const { company, customer, document, items } = snapshot;

  return (
    <Document
      author={company.legalName}
      creator="KlaroCRM"
      language="de-DE"
      title={`${title} ${document.documentNo}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.row, styles.section]}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{document.documentNo}</Text>
          </View>
          <View>
            <Text>{company.legalName}</Text>
            <Text style={styles.small}>{company.billingAddress.line1}</Text>
            <Text style={styles.small}>
              {company.billingAddress.postalCode} {company.billingAddress.city}
            </Text>
            <Text style={styles.small}>USt-IdNr. {company.vatId}</Text>
          </View>
        </View>

        <View style={[styles.row, styles.section]}>
          <View style={[styles.panel, { flex: 1 }]}>
            <Text style={styles.label}>Rechnung an</Text>
            <Text style={styles.heading}>{customer.companyName}</Text>
            <Text>{customer.billingAddress.line1}</Text>
            <Text>
              {customer.billingAddress.postalCode}{" "}
              {customer.billingAddress.city}
            </Text>
            <Text>{customer.billingAddress.country}</Text>
          </View>

          <View style={[styles.panel, { flex: 1 }]}>
            <Text style={styles.label}>Rechnungsdetails</Text>
            <Text>Rechnungsdatum: {document.issueDate}</Text>
            <Text>
              Leistungsdatum: {document.serviceDate ?? document.issueDate}
            </Text>
            <Text>Faelligkeit: {document.dueDate ?? "-"}</Text>
            <Text>Zahlungsziel: {document.paymentTerms}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 3 }}>Leistung</Text>
            <Text style={{ flex: 1 }}>Menge</Text>
            <Text style={{ flex: 1.4 }}>Netto</Text>
            <Text style={{ flex: 1.2 }}>USt.</Text>
            <Text style={{ flex: 1.4 }}>Brutto</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={{ flex: 3 }}>
                <Text>{item.description}</Text>
                <Text style={styles.small}>{item.sku ?? "Kein SKU"}</Text>
              </View>
              <Text style={{ flex: 1 }}>{item.qty.toFixed(2)}</Text>
              <Text style={{ flex: 1.4 }}>
                {formatMoney(item.lineNetCents)}
              </Text>
              <Text style={{ flex: 1.2 }}>{item.taxRate.toFixed(0)}%</Text>
              <Text style={{ flex: 1.4 }}>
                {formatMoney(item.lineGrossCents)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.row, { marginTop: 18 }]}>
          <View style={{ flex: 1.3 }}>
            <Text style={styles.label}>Hinweise</Text>
            <Text>{document.legalFooter}</Text>
            <Text style={[styles.small, { marginTop: 10 }]}>
              EN 16931 placeholders gespeichert:{" "}
              {Object.keys(document.einvoicePayload).join(", ")}
            </Text>
          </View>
          <View style={[styles.panel, { flex: 0.9 }]}>
            <View style={styles.totalRow}>
              <Text>Netto</Text>
              <Text>{formatMoney(document.subtotalNetCents)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Umsatzsteuer</Text>
              <Text>{formatMoney(document.taxTotalCents)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={{ fontWeight: 700 }}>Bruttobetrag</Text>
              <Text style={{ fontWeight: 700 }}>
                {formatMoney(document.totalGrossCents)}
              </Text>
            </View>
            <Text style={[styles.small, { marginTop: 12 }]}>
              IBAN {company.iban} / BIC {company.bic}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function InvoicePdfDocument({
  snapshot,
}: {
  snapshot: DocumentSnapshot;
}) {
  return <PdfTemplate snapshot={snapshot} title="Rechnung" />;
}

export function QuotePdfDocument({ snapshot }: { snapshot: DocumentSnapshot }) {
  return <PdfTemplate snapshot={snapshot} title="Angebot" />;
}
