import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, ShieldCheck, Sparkles } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { AppNavigation } from "@/components/app-navigation";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { SessionContext } from "@/lib/types";

type AppShellProps = {
  session: SessionContext;
  children: ReactNode;
};

export function AppShell({ session, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:px-6">
        <aside className="surface-panel enterprise-grid border-border/70 hidden w-[260px] shrink-0 rounded-[28px] border p-4 lg:flex lg:flex-col">
          <Link className="mb-8 flex items-center gap-3 px-2" href="/dashboard">
            <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-2xl">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.28em] uppercase">
                KlaroCRM
              </p>
              <p className="text-foreground text-sm font-semibold">
                Vertriebssystem
              </p>
            </div>
          </Link>

          <AppNavigation session={session} />

          <div className="border-border/70 bg-background/30 mt-auto rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
              Betriebsmodus
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-foreground text-sm font-medium">
                  {session.mode === "demo" ? "Demo Scaffold" : "Live Workspace"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Rolle: {session.role}
                </p>
              </div>
              <ShieldCheck className="text-accent size-4" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="surface-panel border-border/70 flex items-center justify-between gap-3 rounded-[28px] border px-4 py-3">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      className="lg:hidden"
                      size="icon-sm"
                      type="button"
                      variant="outline"
                    />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent
                  className="surface-panel border-border/70 w-[86vw] p-4"
                  side="left"
                >
                  <div className="mb-6">
                    <p className="text-muted-foreground text-xs tracking-[0.28em] uppercase">
                      KlaroCRM
                    </p>
                    <p className="text-foreground mt-2 text-lg font-semibold">
                      Mobile Navigation
                    </p>
                  </div>
                  <AppNavigation session={session} />
                </SheetContent>
              </Sheet>
              <CommandMenu />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      className="border-border/70 bg-background/70 backdrop-blur"
                      type="button"
                      variant="outline"
                    />
                  }
                >
                  <span className="text-left">
                    <span className="text-foreground block text-sm font-medium">
                      {session.user.fullName}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {session.user.email}
                    </span>
                  </span>
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-border/70 bg-popover/95 w-64 rounded-2xl p-1 backdrop-blur">
                  <DropdownMenuItem className="rounded-xl px-3 py-2">
                    Rolle: {session.role}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl px-3 py-2">
                    Modus: {session.mode}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl px-0 py-0">
                    <form action={signOutAction} className="w-full">
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left"
                        type="submit"
                      >
                        <LogOut className="size-4" />
                        Abmelden
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="border-border/70 bg-background/25 min-w-0 flex-1 rounded-[32px] border p-4 backdrop-blur lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
