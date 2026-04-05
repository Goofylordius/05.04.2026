import "server-only";

import { google } from "googleapis";

import { appEnv, getRequiredEnv } from "@/lib/env";

export const googleCalendarScopes = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    getRequiredEnv("GOOGLE_CLIENT_ID", appEnv.googleClientId),
    getRequiredEnv("GOOGLE_CLIENT_SECRET", appEnv.googleClientSecret),
    `${appEnv.siteUrl}/api/google/calendar/callback`,
  );
}

export function createGoogleCalendarAuthUrl(userId: string) {
  const oauthClient = createGoogleOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: googleCalendarScopes,
    state: userId,
  });
}
