import {
  enrollTotpAction,
  unenrollTotpAction,
  verifyTotpAction,
} from "@/actions/security";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireSessionContext } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SecurityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityPage({
  searchParams,
}: SecurityPageProps) {
  await requireSessionContext("security.manage");
  const query = await searchParams;

  let assuranceLevel: {
    currentLevel: string | null;
    nextLevel: string | null;
  } | null = null;
  let factors: Array<{
    id: string;
    friendly_name?: string;
    status?: string;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const [{ data: factorData }, { data: assuranceData }] = await Promise.all(
        [
          supabase.auth.mfa.listFactors(),
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        ],
      );

      factors = (factorData?.totp ?? []) as Array<{
        id: string;
        friendly_name?: string;
        status?: string;
      }>;
      assuranceLevel = assuranceData
        ? {
            currentLevel: assuranceData.currentLevel,
            nextLevel: assuranceData.nextLevel,
          }
        : null;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Unable to load MFA state", error);
      }
    }
  }

  const factorId = typeof query.factorId === "string" ? query.factorId : "";
  const secret = typeof query.secret === "string" ? query.secret : "";
  const uri = typeof query.uri === "string" ? query.uri : "";

  return (
    <div className="space-y-6">
      <PageHeader
        description="Optionale TOTP-Zweitfaktoren fuer Benutzerkonten. In Produktion fuer Admin und Sales empfehlen."
        eyebrow="Security"
        title="MFA & Zugriffsschutz"
      />

      {typeof query.error === "string" ? (
        <div className="border-destructive/40 bg-destructive/10 text-foreground rounded-2xl border p-3 text-sm">
          {query.error}
        </div>
      ) : null}

      {typeof query.message === "string" ? (
        <div className="border-primary/40 bg-primary/10 text-foreground rounded-2xl border p-3 text-sm">
          {query.message}
        </div>
      ) : null}

      {!isSupabaseConfigured() ? (
        <Card className="surface-panel border-border/70 border">
          <CardContent className="text-muted-foreground py-6 text-sm">
            Demo-Modus: Die MFA-Oberflaeche ist vorbereitet, benoetigt fuer
            echte Enrollments aber eine konfigurierte Supabase-Auth-Instanz.
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Authenticator Assurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current</span>
              <span>{assuranceLevel?.currentLevel ?? "aal1"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next</span>
              <span>{assuranceLevel?.nextLevel ?? "aal2"}</span>
            </div>
            <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-3">
              Optional in v1, aber fuer Admin- und Sales-Rollen im Go-Live
              empfohlen.
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>TOTP Faktor anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={enrollTotpAction}
              className="grid gap-4 lg:grid-cols-[1fr_auto]"
            >
              <div className="space-y-2">
                <Label htmlFor="friendlyName">Anzeigename</Label>
                <Input
                  defaultValue="KlaroCRM Authenticator"
                  id="friendlyName"
                  name="friendlyName"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">TOTP starten</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {factorId && secret ? (
        <Card className="surface-panel border-border/70 border">
          <CardHeader>
            <CardTitle>Faktor verifizieren</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-3 text-sm">
              <div className="border-border/70 bg-background/25 rounded-2xl border p-4">
                <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                  Secret
                </p>
                <p className="text-foreground mt-2 font-mono">{secret}</p>
              </div>
              <div className="border-border/70 bg-background/25 rounded-2xl border p-4">
                <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                  OTP URI
                </p>
                <p className="text-foreground mt-2 font-mono text-xs break-all">
                  {uri}
                </p>
              </div>
            </div>
            <form action={verifyTotpAction} className="space-y-4">
              <input name="factorId" type="hidden" value={factorId} />
              <div className="space-y-2">
                <Label htmlFor="code">6-stelliger Code</Label>
                <Input id="code" name="code" pattern="[0-9]{6}" required />
              </div>
              <Button className="w-full" type="submit">
                Faktor verifizieren
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="surface-panel border-border/70 border">
        <CardHeader>
          <CardTitle>Aktive Faktoren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {factors.length === 0 ? (
            <div className="border-border/70 bg-background/25 text-muted-foreground rounded-2xl border p-4 text-sm">
              Noch kein TOTP-Faktor aktiviert.
            </div>
          ) : (
            factors.map((factor) => (
              <div
                className="border-border/70 bg-background/25 flex items-center justify-between gap-3 rounded-2xl border p-4"
                key={factor.id}
              >
                <div>
                  <p className="text-foreground font-medium">
                    {factor.friendly_name ?? "Authenticator App"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {factor.status ?? "unverified"}
                  </p>
                </div>
                <form action={unenrollTotpAction}>
                  <input name="factorId" type="hidden" value={factor.id} />
                  <Button type="submit" variant="outline">
                    Entfernen
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
