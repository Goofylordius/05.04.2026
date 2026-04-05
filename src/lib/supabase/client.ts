"use client";

import { createBrowserClient } from "@supabase/ssr";

import { appEnv, isSupabaseConfigured } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      appEnv.supabaseUrl,
      appEnv.supabaseAnonKey,
    );
  }

  return browserClient;
}
