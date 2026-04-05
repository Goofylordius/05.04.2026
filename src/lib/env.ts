export const appEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleWebhookSecret: process.env.GOOGLE_CALENDAR_WEBHOOK_SECRET ?? "",
  calendarEncryptionKey:
    process.env.CALENDAR_TOKEN_ENCRYPTION_KEY ?? "demo-only-calendar-key",
  internalCronSecret: process.env.INTERNAL_CRON_SECRET ?? "",
};

export function isSupabaseConfigured() {
  return Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
}

export function hasServiceRoleConfig() {
  return Boolean(
    isSupabaseConfigured() && appEnv.supabaseServiceRoleKey.length > 0,
  );
}

export function isGoogleCalendarConfigured() {
  return Boolean(appEnv.googleClientId && appEnv.googleClientSecret);
}

export function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
