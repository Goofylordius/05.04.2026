import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSessionContext } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, query] = await Promise.all([
    getSessionContext(),
    searchParams,
  ]);

  if (session) {
    redirect("/dashboard");
  }

  const nextPath =
    typeof query.next === "string" && query.next.startsWith("/")
      ? query.next
      : "/dashboard";

  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader className="space-y-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">
            KlaroCRM Access
          </p>
          <CardTitle className="mt-3 text-3xl tracking-tight">
            Secure workspace login
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm leading-6">
          DSGVO-orientierter Arbeitsbereich fuer Vertrieb, Dokumente und
          Kalender-Synchronisation.
        </p>
        {!isSupabaseConfigured() ? (
          <div className="border-accent/40 bg-accent/10 text-foreground rounded-2xl border p-3 text-sm">
            Demo-Modus aktiv. Die Anmeldung ueberspringt Auth und leitet direkt
            ins Dashboard.
          </div>
        ) : null}
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
      </CardHeader>
      <CardContent>
        <form action={signInAction} className="space-y-4">
          <input name="next" type="hidden" value={nextPath} />
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              defaultValue={isSupabaseConfigured() ? "" : "leitung@klarocrm.de"}
              id="email"
              name="email"
              placeholder="name@unternehmen.de"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Passwort</Label>
              <Link
                className="text-primary hover:text-primary/80 text-xs font-medium transition"
                href="/forgot-password"
              >
                Passwort vergessen
              </Link>
            </div>
            <Input
              defaultValue={isSupabaseConfigured() ? "" : "demo-access"}
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          <Button className="w-full" type="submit">
            Anmelden
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
