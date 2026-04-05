"use server";

import { redirect } from "next/navigation";

import { appEnv, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "/dashboard";
  return nextPath.startsWith("/") ? nextPath : "/dashboard";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!isSupabaseConfigured()) {
    redirect(nextPath);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(nextPath);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");

  if (!isSupabaseConfigured()) {
    redirect(
      "/forgot-password?message=Demo-Modus%3A%20kein%20Reset%20erforderlich",
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appEnv.siteUrl}/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    "/forgot-password?message=Wenn%20das%20Konto%20existiert,%20wurde%20eine%20E-Mail%20versendet.",
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    redirect(
      "/reset-password?message=Demo-Modus%3A%20kein%20Passwortwechsel%20notwendig",
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Passwort%20aktualisiert");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/login?message=Abgemeldet");
}
