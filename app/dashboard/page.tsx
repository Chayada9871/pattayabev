import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const session = await requireSession();

  redirect(getDashboardRoute(session.user.role));
}
