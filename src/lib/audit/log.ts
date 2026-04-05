import "server-only";

import { hasServiceRoleConfig } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

type AuditLogInput = {
  actorUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  diff?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditLogInput) {
  if (!hasServiceRoleConfig()) {
    return;
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    diff: input.diff ?? {},
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.error("Failed to write audit log", error);
  }
}
