import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  switch (session.user.role) {
    case "LICENSEE":
      redirect("/dashboard/licensee");
    case "TENANT_ADMIN":
    case "REVIEWER":
      redirect("/dashboard/admin");
    default:
      redirect("/login");
  }
}
