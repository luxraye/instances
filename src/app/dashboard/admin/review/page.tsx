import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReviewClient } from "./review-client";

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN" && session.user.role !== "REVIEWER") {
    redirect("/dashboard/admin");
  }

  const instances = await prisma.instance.findMany({
    where: { tenantId: session.user.tenantId, status: "SUBMITTED" },
    include: {
      template: { select: { name: true, code: true } },
      assignee: { select: { name: true, email: true } },
      files: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Review Queue</h1>
      <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
        Submitted compliance filings awaiting a BOBS decision.{" "}
        {instances.length > 0 && <strong>{instances.length} pending.</strong>}
      </p>
      <ReviewClient instances={JSON.parse(JSON.stringify(instances))} />
    </div>
  );
}
