const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(amountCents: number, currency = "EUR") {
  if (currency !== "EUR") {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
    }).format(amountCents / 100);
  }

  return eurFormatter.format(amountCents / 100);
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "Nicht gesetzt";
  }

  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "Nicht synchronisiert";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatPercentage(value: number) {
  return `${value.toFixed(0)}%`;
}

export function formatCompactCurrency(amountCents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amountCents / 100);
}
