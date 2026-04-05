import Link from "next/link";

import { requestPasswordResetAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const query = await searchParams;

  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">
          Zugang wiederherstellen
        </p>
        <CardTitle className="mt-3 text-3xl tracking-tight">
          Passwort-Reset
        </CardTitle>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Wir senden einen sicheren Link an die hinterlegte E-Mail-Adresse.
        </p>
        {typeof query.error === "string" ? (
          <div className="border-destructive/40 bg-destructive/10 text-foreground mt-4 rounded-2xl border p-3 text-sm">
            {query.error}
          </div>
        ) : null}
        {typeof query.message === "string" ? (
          <div className="border-primary/40 bg-primary/10 text-foreground mt-4 rounded-2xl border p-3 text-sm">
            {query.message}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <form action={requestPasswordResetAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@unternehmen.de"
              required
              type="email"
            />
          </div>
          <Button className="w-full" type="submit">
            Reset-Link anfordern
          </Button>
          <Link
            className="text-primary hover:text-primary/80 block text-center text-sm font-medium transition"
            href="/login"
          >
            Zurueck zur Anmeldung
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
