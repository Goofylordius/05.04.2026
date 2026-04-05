import { describe, expect, it } from "vitest";

import { getPermissionsForRole, hasPermission } from "@/lib/rbac/permissions";

describe("rbac permissions", () => {
  it("grants document management to sales", () => {
    expect(hasPermission("sales", "documents.manage")).toBe(true);
  });

  it("does not grant CRM write access to viewers", () => {
    expect(hasPermission("viewer", "crm.manage")).toBe(false);
  });

  it("returns a stable permission list per role", () => {
    expect(getPermissionsForRole("admin")).toContain("users.manage");
    expect(getPermissionsForRole("viewer")).toContain("security.manage");
  });
});
