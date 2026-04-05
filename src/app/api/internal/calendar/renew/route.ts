import { NextRequest, NextResponse } from "next/server";

import { appEnv } from "@/lib/env";
import { renewExpiringCalendarWatches } from "@/lib/google-calendar/sync";

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (
    !appEnv.internalCronSecret ||
    authorization !== `Bearer ${appEnv.internalCronSecret}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await renewExpiringCalendarWatches();
  return NextResponse.json({ ok: true, ...result });
}
