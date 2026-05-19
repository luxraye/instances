import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MatrixAdmin } from "./matrix-admin";

export default async function MatrixPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN") redirect("/dashboard/admin");

  const dimensions = await prisma.matrixDimension.findMany({
    where: { tenantId: session.user.tenantId },
    include: { values: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const totalValues = dimensions.reduce((s, d) => s + d.values.length, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Classification Matrix</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Define industry sector and certification type dimensions. Tag templates to matrix values
          for context-aware provisioning.
          {dimensions.length > 0 && (
            <span className="ml-2 font-medium" style={{ color: "#213976" }}>
              {dimensions.length} dimension{dimensions.length !== 1 ? "s" : ""} &middot; {totalValues} values
            </span>
          )}
        </p>
      </div>
      <MatrixAdmin initialDimensions={JSON.parse(JSON.stringify(dimensions))} />
    </div>
  );
}
