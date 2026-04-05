import "server-only";

import { createClient } from "@supabase/supabase-js";

import { appEnv, getRequiredEnv, hasServiceRoleConfig } from "@/lib/env";

export function createServiceSupabaseClient() {
  if (!hasServiceRoleConfig()) {
    throw new Error("Supabase service role configuration is missing.");
  }

  return createClient(
    appEnv.supabaseUrl,
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", appEnv.supabaseServiceRoleKey),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
