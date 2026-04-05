"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";
import { hasPermission } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";
import type { SessionContext } from "@/lib/types";

type AppNavigationProps = {
  session: SessionContext;
  onNavigate?: () => void;
};

export function AppNavigation({ session, onNavigate }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigationItems
        .filter((item) => hasPermission(session.role, item.permission))
        .map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition",
                active &&
                  "surface-panel border-border/80 bg-card text-foreground shadow-lg",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
    </nav>
  );
}
