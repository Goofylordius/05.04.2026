import { NextRequest, NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth/session";
import { connectGoogleCalendar } from "@/lib/google-calendar/sync";

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!session || !code || !state || state !== session.user.id) {
    return NextResponse.redirect(
      new URL("/calendar?error=OAuth%20Handshake%20ungueltig", request.url),
    );
  }

  try {
    await connectGoogleCalendar(session.user.id, code);
    return NextResponse.redirect(
      new URL("/calendar?message=Google%20Kalender%20verbunden", request.url),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Google Verbindung fehlgeschlagen";

    return NextResponse.redirect(
      new URL(`/calendar?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
