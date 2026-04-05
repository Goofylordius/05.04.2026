import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { Permission } from "@/lib/types";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    title: "Kunden",
    href: "/crm/customers",
    icon: Users,
    permission: "crm.view",
  },
  {
    title: "Deals",
    href: "/crm/deals",
    icon: CircleDollarSign,
    permission: "crm.view",
  },
  {
    title: "Kalender",
    href: "/calendar",
    icon: CalendarDays,
    permission: "calendar.view",
  },
  {
    title: "Dokumente",
    href: "/documents/document-1",
    icon: Building2,
    permission: "documents.view",
  },
  {
    title: "Sicherheit",
    href: "/settings/security",
    icon: ShieldCheck,
    permission: "security.manage",
  },
];
