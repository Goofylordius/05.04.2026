import { AppShell } from "@/components/app-shell";
import { requireSessionContext } from "@/lib/auth/session";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSessionContext();

  return <AppShell session={session}>{children}</AppShell>;
}
