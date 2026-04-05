import { NextRequest, NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth/session";
import { isGoogleCalendarConfigured } from "@/lib/env";
import { createGoogleCalendarAuthUrl } from "@/lib/google-calendar/oauth";

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/calendar?error=Google%20ist%20nicht%20konfiguriert",
        request.url,
      ),
    );
  }

  return NextResponse.redirect(createGoogleCalendarAuthUrl(session.user.id));
}
