import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProvisionForm } from "./provision-form";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-pending", IN_PROGRESS: "badge-progress", SUBMITTED: "badge-submitted",
    APPROVED: "badge-approved", FLAGGED: "badge-flagged", REJECTED: "badge-rejected",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending", IN_PROGRESS: "In Progress", SUBMITTED: "Submitted",
    APPROVED: "Approved", FLAGGED: "Flagged", REJECTED: "Rejected",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function AdminInstancesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN") redirect("/dashboard/admin");

  const [instances, templates, licensees] = await Promise.all([
    prisma.instance.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        template: { select: { name: true, code: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.findMany({
      where: { tenantId: session.user.tenantId, status: "PUBLISHED" },
      select: { id: true, name: true, code: true },
    }),
    prisma.user.findMany({
      where: { tenantId: session.user.tenantId, role: "LICENSEE" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>All Submissions</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Provision new compliance submissions and view the full submission register.
        </p>
      </div>

      <ProvisionForm templates={templates} licensees={licensees} />

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "#6c757d" }}>
          Submission register ({instances.length})
        </h2>
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: "#d9dde3" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d9dde3" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Organisation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Template</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((i, idx) => (
                <tr key={i.id} style={{ borderTop: idx === 0 ? undefined : "1px solid #f0f0f0" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: "#222733" }}>{i.assignee.name}</p>
                    <p className="text-xs" style={{ color: "#6c757d" }}>{i.assignee.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: "#222733" }}>{i.template.name}</p>
                    <p className="text-xs font-mono" style={{ color: "#6c757d" }}>{i.template.code}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#6c757d" }}>
                    {new Date(i.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {instances.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: "#6c757d" }}>No submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
