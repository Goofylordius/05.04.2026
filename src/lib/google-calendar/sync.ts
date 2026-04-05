import "server-only";

import { randomUUID } from "node:crypto";

import type { calendar_v3 } from "googleapis";

import { appEnv, isGoogleCalendarConfigured } from "@/lib/env";
import { createGoogleCalendarClient } from "@/lib/google-calendar/client";
import { createGoogleOAuthClient } from "@/lib/google-calendar/oauth";
import { logAuditEvent } from "@/lib/audit/log";
import { encryptSecret } from "@/lib/security/encryption";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

type CalendarConnectionRow = {
  user_id: string;
  encrypted_refresh_token: string;
  sync_token: string | null;
};

function mapGoogleEvent(
  userId: string,
  event: calendar_v3.Schema$Event,
): Record<string, string | null> {
  return {
    owner_user_id: userId,
    google_event_id: event.id ?? null,
    title: event.summary ?? "Google Termin",
    starts_at: event.start?.dateTime ?? event.start?.date ?? null,
    ends_at: event.end?.dateTime ?? event.end?.date ?? null,
    location: event.location ?? null,
    notes: event.description ?? null,
    sync_state: "synced",
    external_updated_at: event.updated ?? null,
  };
}

async function renewWatchForUser(
  userId: string,
  encryptedRefreshToken: string,
) {
  if (!isGoogleCalendarConfigured()) {
    return null;
  }

  const supabase = createServiceSupabaseClient();
  const { calendar } = createGoogleCalendarClient(encryptedRefreshToken);
  const channelId = randomUUID();
  const response = await calendar.events.watch({
    calendarId: "primary",
    requestBody: {
      id: channelId,
      type: "web_hook",
      address: `${appEnv.siteUrl}/api/google/calendar/webhook`,
      token: appEnv.googleWebhookSecret
        ? `${appEnv.googleWebhookSecret}:${userId}`
        : userId,
      params: {
        ttl: String(60 * 60 * 24 * 7),
      },
    },
  });

  await supabase.from("calendar_watch_channels").upsert(
    {
      id: randomUUID(),
      user_id: userId,
      google_resource_id: response.data.resourceId,
      google_channel_id: response.data.id,
      expires_at: response.data.expiration
        ? new Date(Number(response.data.expiration)).toISOString()
        : null,
      status: "active",
    },
    { onConflict: "google_channel_id" },
  );

  return response.data;
}

export async function connectGoogleCalendar(userId: string, code: string) {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Google Calendar is not configured.");
  }

  const supabase = createServiceSupabaseClient();
  const oauthClient = createGoogleOAuthClient();
  const { tokens } = await oauthClient.getToken(code);
  const encryptedRefreshToken = encryptSecret(tokens.refresh_token ?? "");

  if (!tokens.refresh_token) {
    throw new Error("No refresh token returned by Google.");
  }

  await supabase.from("calendar_connections").upsert(
    {
      user_id: userId,
      google_email: null,
      access_scope: tokens.scope ?? null,
      encrypted_refresh_token: encryptedRefreshToken,
      token_expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      status: "connected",
      last_synced_at: null,
    },
    { onConflict: "user_id" },
  );

  await syncGoogleCalendarForUser(userId);
  await renewWatchForUser(userId, encryptedRefreshToken);
}

export async function syncGoogleCalendarForUser(userId: string) {
  const supabase = createServiceSupabaseClient();
  const { data: connection, error } = await supabase
    .from("calendar_connections")
    .select("user_id, encrypted_refresh_token, sync_token")
    .eq("user_id", userId)
    .single();

  if (error || !connection) {
    throw error ?? new Error("Calendar connection not found.");
  }

  const row = connection as CalendarConnectionRow;
  const { calendar } = createGoogleCalendarClient(row.encrypted_refresh_token);

  let nextSyncToken = row.sync_token ?? undefined;
  let pageToken: string | undefined;
  let syncedCount = 0;

  try {
    do {
      const response = await calendar.events.list({
        calendarId: "primary",
        maxResults: 2500,
        pageToken,
        showDeleted: true,
        singleEvents: true,
        syncToken: nextSyncToken,
        ...(nextSyncToken
          ? {}
          : {
              timeMin: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 90,
              ).toISOString(),
            }),
      });

      const events = response.data.items ?? [];
      pageToken = response.data.nextPageToken ?? undefined;
      nextSyncToken = response.data.nextSyncToken ?? nextSyncToken;

      for (const event of events) {
        if (!event.id) {
          continue;
        }

        if (event.status === "cancelled") {
          await supabase
            .from("appointments")
            .delete()
            .eq("google_event_id", event.id);
          continue;
        }

        await supabase
          .from("appointments")
          .upsert(mapGoogleEvent(userId, event), {
            onConflict: "google_event_id",
          });
        syncedCount += 1;
      }
    } while (pageToken);
  } catch (syncError) {
    if (
      typeof syncError === "object" &&
      syncError !== null &&
      "code" in syncError &&
      Number(syncError.code) === 410
    ) {
      await supabase
        .from("calendar_connections")
        .update({ sync_token: null })
        .eq("user_id", userId);
      return syncGoogleCalendarForUser(userId);
    }

    throw syncError;
  }

  await supabase
    .from("calendar_connections")
    .update({
      sync_token: nextSyncToken ?? null,
      status: "connected",
      last_synced_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await logAuditEvent({
    actorUserId: userId,
    entityType: "calendar",
    entityId: userId,
    action: "calendar.sync_completed",
    diff: { syncedCount },
  });

  return { syncedCount, nextSyncToken };
}

export async function renewExpiringCalendarWatches() {
  const supabase = createServiceSupabaseClient();
  const threshold = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const { data, error } = await supabase
    .from("calendar_connections")
    .select("user_id, encrypted_refresh_token");

  if (error || !data) {
    throw error ?? new Error("Unable to load calendar connections.");
  }

  const { data: channels } = await supabase
    .from("calendar_watch_channels")
    .select("user_id, expires_at")
    .lte("expires_at", threshold);

  const expiringUsers = new Set((channels ?? []).map((row) => row.user_id));

  const results = await Promise.all(
    data
      .filter(
        (row) => expiringUsers.size === 0 || expiringUsers.has(row.user_id),
      )
      .map((row) =>
        renewWatchForUser(row.user_id, String(row.encrypted_refresh_token)),
      ),
  );

  return { renewed: results.filter(Boolean).length };
}
