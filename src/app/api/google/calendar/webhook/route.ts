import { NextRequest, NextResponse } from "next/server";

import { appEnv } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { syncGoogleCalendarForUser } from "@/lib/google-calendar/sync";

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export async function POST(request: NextRequest) {
  const channelId = request.headers.get("x-goog-channel-id");
  const token = request.headers.get("x-goog-channel-token");

  if (!channelId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    appEnv.googleWebhookSecret &&
    (!token || !token.startsWith(appEnv.googleWebhookSecret))
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("calendar_watch_channels")
    .select("user_id")
    .eq("google_channel_id", channelId)
    .maybeSingle();

  if (!data?.user_id) {
    return NextResponse.json({ ok: true });
  }

  await syncGoogleCalendarForUser(data.user_id);

  return NextResponse.json({ ok: true });
}
