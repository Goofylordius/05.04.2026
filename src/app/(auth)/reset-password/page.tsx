import { updatePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const query = await searchParams;

  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">
          Neues Passwort
        </p>
        <CardTitle className="mt-3 text-3xl tracking-tight">
          Zugang absichern
        </CardTitle>
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
        <form action={updatePasswordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input id="password" name="password" required type="password" />
          </div>
          <Button className="w-full" type="submit">
            Passwort speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
