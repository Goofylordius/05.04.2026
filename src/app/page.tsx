import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSessionContext();

  redirect(session ? "/dashboard" : "/login");
}
