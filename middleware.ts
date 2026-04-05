import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/crm",
  "/calendar",
  "/documents",
  "/settings",
];

const AUTH_PAGES = ["/login", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.some((route) => pathname.startsWith(route));

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/dashboard";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
