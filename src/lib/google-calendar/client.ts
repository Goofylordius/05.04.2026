import "server-only";

import { google } from "googleapis";

import { decryptSecret } from "@/lib/security/encryption";
import { createGoogleOAuthClient } from "@/lib/google-calendar/oauth";

export function createGoogleCalendarClient(encryptedRefreshToken: string) {
  const oauthClient = createGoogleOAuthClient();
  oauthClient.setCredentials({
    refresh_token: decryptSecret(encryptedRefreshToken),
  });

  return {
    oauthClient,
    calendar: google.calendar({
      version: "v3",
      auth: oauthClient,
    }),
  };
}
