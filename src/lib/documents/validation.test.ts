import { describe, expect, it } from "vitest";

import { getDocumentSnapshot } from "@/lib/demo-data";
import {
  calculateDocumentTotals,
  validateDocumentSnapshot,
} from "@/lib/documents/validation";

describe("document validation", () => {
  it("accepts the bundled demo invoice snapshot", () => {
    const snapshot = getDocumentSnapshot("document-1");

    expect(snapshot).not.toBeNull();
    expect(validateDocumentSnapshot(snapshot!)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("flags mismatching totals", () => {
    const snapshot = getDocumentSnapshot("document-1");

    expect(snapshot).not.toBeNull();

    const broken = {
      ...snapshot!,
      document: {
        ...snapshot!.document,
        totalGrossCents: snapshot!.document.totalGrossCents + 1,
      },
    };

    const result = validateDocumentSnapshot(broken);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Brutto-Summe stimmt nicht mit den Positionen ueberein.",
    );
  });

  it("calculates line item totals in cents", () => {
    const snapshot = getDocumentSnapshot("document-1");
    expect(snapshot).not.toBeNull();

    expect(calculateDocumentTotals(snapshot!.items)).toEqual({
      net: 1860000,
      tax: 353400,
      gross: 2213400,
    });
  });
});
