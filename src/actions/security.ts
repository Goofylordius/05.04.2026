"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function enrollTotpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect(
      "/settings/security?message=Demo-Modus%3A%20MFA%20wird%20nicht%20persistiert",
    );
  }

  const friendlyName = String(
    formData.get("friendlyName") ?? "KlaroCRM Authenticator",
  );
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName,
  });

  if (error || data.type !== "totp") {
    redirect(
      `/settings/security?error=${encodeURIComponent(error?.message ?? "MFA enrollment failed")}`,
    );
  }

  const query = new URLSearchParams({
    factorId: data.id,
    secret: data.totp.secret,
    uri: data.totp.uri,
    message: "TOTP-Faktor angelegt. Bitte jetzt verifizieren.",
  });

  redirect(`/settings/security?${query.toString()}`);
}

export async function verifyTotpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/settings/security?message=Demo-Modus%3A%20MFA%20simuliert");
  }

  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) {
    redirect(`/settings/security?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings/security?message=MFA erfolgreich aktiviert");
}

export async function unenrollTotpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/settings/security?message=Demo-Modus%3A%20MFA%20simuliert");
  }

  const factorId = String(formData.get("factorId") ?? "");
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) {
    redirect(`/settings/security?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/settings/security?message=MFA-Faktor entfernt");
}
