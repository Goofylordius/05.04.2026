import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { appEnv } from "@/lib/env";

export function createMiddlewareSupabaseClient(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    appEnv.supabaseUrl,
    appEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  return { supabase, response };
}
