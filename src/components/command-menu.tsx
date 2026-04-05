"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

const quickLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Search,
  },
  {
    label: "Kundenliste",
    href: "/crm/customers",
    icon: Users,
  },
  {
    label: "Deals",
    href: "/crm/deals",
    icon: CircleDollarSign,
  },
  {
    label: "Kalender",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Dokumente",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Unternehmen",
    href: "/settings/company",
    icon: Building2,
  },
  {
    label: "Sicherheit",
    href: "/settings/security",
    icon: ShieldCheck,
  },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        className="border-border/70 bg-background/70 text-muted-foreground hidden min-w-56 justify-between backdrop-blur md:inline-flex"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="size-4" />
          Navigation, Kunden, Dokumente
        </span>
        <span className="border-border/80 rounded border px-1.5 py-0.5 font-mono text-[11px]">
          Ctrl K
        </span>
      </Button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Suche in Bereichen und Modulen..." />
        <CommandList>
          <CommandEmpty>Keine Treffer.</CommandEmpty>
          <CommandGroup heading="Springen">
            {quickLinks.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  setOpen(false);
                }}
              >
                <Link
                  className="flex w-full items-center gap-2"
                  href={item.href}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
                <CommandShortcut>Open</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
