import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
      <p
        className="text-2xl font-bold"
        style={{ color: accent ?? "#213976" }}
      >
        {value}
      </p>
      <p className="text-sm font-medium mt-0.5" style={{ color: "#222733" }}>{label}</p>
      {sub ? <p className="text-xs mt-1" style={{ color: "#6c757d" }}>{sub}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-pending",
    IN_PROGRESS: "badge-progress",
    SUBMITTED: "badge-submitted",
    APPROVED: "badge-approved",
    FLAGGED: "badge-flagged",
    REJECTED: "badge-rejected",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    SUBMITTED: "Submitted",
    APPROVED: "Approved",
    FLAGGED: "Flagged",
    REJECTED: "Rejected",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN" && session.user.role !== "REVIEWER") {
    redirect("/dashboard");
  }

  const tid = session.user.tenantId;

  const [
    templateCount,
    totalInstances,
    pendingCount,
    inProgressCount,
    submittedCount,
    approvedCount,
    flaggedCount,
    recentInstances,
    overdue,
  ] = await Promise.all([
    prisma.template.count({ where: { tenantId: tid } }),
    prisma.instance.count({ where: { tenantId: tid } }),
    prisma.instance.count({ where: { tenantId: tid, status: "PENDING" } }),
    prisma.instance.count({ where: { tenantId: tid, status: "IN_PROGRESS" } }),
    prisma.instance.count({ where: { tenantId: tid, status: "SUBMITTED" } }),
    prisma.instance.count({ where: { tenantId: tid, status: "APPROVED" } }),
    prisma.instance.count({ where: { tenantId: tid, status: "FLAGGED" } }),
    prisma.instance.findMany({
      where: { tenantId: tid },
      include: {
        template: { select: { name: true, code: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.instance.count({
      where: {
        tenantId: tid,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        deadline: { lt: new Date() },
      },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Overview</h1>
        <p className="text-sm mt-1" style={{ color: "#6c757d" }}>
          Botswana Bureau of Standards — compliance operations dashboard
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total submissions" value={totalInstances} />
        <StatCard label="Awaiting review" value={submittedCount} accent="#5b21b6" sub="Submitted, pending decision" />
        <StatCard label="Flagged" value={flaggedCount} accent="#c2410c" sub="Returned to licensee" />
        <StatCard label="Overdue" value={overdue} accent="#991b1b" sub="Past deadline, unsubmitted" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Templates published" value={templateCount} />
        <StatCard label="Pending" value={pendingCount} accent="#854d0e" />
        <StatCard label="In progress" value={inProgressCount} accent="#1d4ed8" />
        <StatCard label="Approved" value={approvedCount} accent="#166534" />
      </div>

      {/* Quick actions */}
      {session.user.role === "TENANT_ADMIN" && (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin/instances"
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "#213976" }}
          >
            + Provision submission
          </Link>
          <Link
            href="/dashboard/admin/review"
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "#006bb7" }}
          >
            Review queue ({submittedCount})
          </Link>
          <Link
            href="/dashboard/admin/templates"
            className="rounded-md border px-4 py-2 text-sm font-medium"
            style={{ borderColor: "#d9dde3", color: "#213976" }}
          >
            Manage templates
          </Link>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: "#213976" }}>Recent activity</h2>
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
              {recentInstances.map((inst, i) => (
                <tr
                  key={inst.id}
                  style={{ borderTop: i === 0 ? undefined : "1px solid #f0f0f0" }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: "#222733" }}>{inst.assignee.name}</p>
                    <p className="text-xs" style={{ color: "#6c757d" }}>{inst.assignee.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: "#222733" }}>{inst.template.name}</p>
                    <p className="text-xs font-mono" style={{ color: "#6c757d" }}>{inst.template.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inst.status} />
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#6c757d" }}>
                    {new Date(inst.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentInstances.length === 0 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: "#6c757d" }}>No submissions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
