import { cache } from "react";
import { redirect } from "next/navigation";

import { demoSession } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { getPermissionsForRole, hasPermission } from "@/lib/rbac/permissions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole, Permission, SessionContext } from "@/lib/types";

function parseRole(value: unknown): AppRole {
  if (value === "admin" || value === "sales" || value === "viewer") {
    return value;
  }

  return "viewer";
}

function buildAvatarFallback(fullName: string, email?: string | null) {
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");

  if (initials) {
    return initials;
  }

  return email?.slice(0, 2).toUpperCase() ?? "KM";
}

export const getSessionContext = cache(
  async (): Promise<SessionContext | null> => {
    if (!isSupabaseConfigured()) {
      return demoSession;
    }

    const supabase = await createServerSupabaseClient();
    const [
      {
        data: { user },
      },
      claimsResult,
    ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getClaims()]);

    if (!user) {
      return null;
    }

    const role = parseRole(claimsResult.data?.claims?.app_role);
    const fullName =
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : (user.email?.split("@")[0] ?? "CRM Nutzer");

    return {
      mode: "live",
      role,
      permissions: getPermissionsForRole(role),
      user: {
        id: user.id,
        email: user.email ?? "unbekannt@example.com",
        fullName,
        avatarFallback: buildAvatarFallback(fullName, user.email),
      },
    };
  },
);

export async function requireSessionContext(permission?: Permission) {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  if (permission && !hasPermission(session.role, permission)) {
    redirect("/dashboard?denied=1");
  }

  return session;
}
