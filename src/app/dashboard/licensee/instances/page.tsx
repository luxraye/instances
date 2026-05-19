import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileBox, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:     { label: "Pending",             bg: "#fef3c7", color: "#92400e" },
    IN_PROGRESS: { label: "In Progress",         bg: "#dbeafe", color: "#1d4ed8" },
    SUBMITTED:   { label: "Submitted",           bg: "#ede9fe", color: "#5b21b6" },
    APPROVED:    { label: "Approved",            bg: "#dcfce7", color: "#166534" },
    FLAGGED:     { label: "Action Required",     bg: "#ffedd5", color: "#c2410c" },
    REJECTED:    { label: "Rejected",            bg: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function isOverdue(deadline: Date, status: string) {
  return ["PENDING", "IN_PROGRESS"].includes(status) && new Date() > deadline;
}

export default async function LicenseeInstancesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instances = await prisma.instance.findMany({
    where: { assigneeId: session.user.id },
    include: { template: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total:     instances.length,
    active:    instances.filter((i) => ["PENDING", "IN_PROGRESS"].includes(i.status)).length,
    submitted: instances.filter((i) => i.status === "SUBMITTED").length,
    approved:  instances.filter((i) => i.status === "APPROVED").length,
    flagged:   instances.filter((i) => ["FLAGGED", "REJECTED"].includes(i.status)).length,
  };

  const statCards = [
    { label: "Total",     value: stats.total,     icon: <FileBox size={20} />,       color: "#006bb7" },
    { label: "Active",    value: stats.active,    icon: <Clock size={20} />,          color: "#f5a623" },
    { label: "Approved",  value: stats.approved,  icon: <CheckCircle2 size={20} />,   color: "#72bf40" },
    { label: "Flagged",   value: stats.flagged,   icon: <AlertTriangle size={20} />,  color: "#e07b39" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>My Submissions</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Compliance filings assigned to your organisation by BOBS
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-4" style={{ border: "1px solid #d9dde3" }}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: "#213976" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#6c757d" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Instances table */}
      {instances.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center" style={{ border: "1px solid #d9dde3" }}>
          <FileBox size={36} className="mx-auto mb-3" style={{ color: "#d9dde3" }} />
          <p className="text-sm font-medium" style={{ color: "#374151" }}>No submissions yet</p>
          <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
            BOBS will assign compliance submissions to your account
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #d9dde3" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #d9dde3" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>
              All submissions ({instances.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d9dde3" }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Service</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Code</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Deadline</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((inst, i) => {
                  const overdue = isOverdue(inst.deadline, inst.status);
                  const canOpen = ["PENDING", "IN_PROGRESS", "FLAGGED"].includes(inst.status);
                  return (
                    <tr
                      key={inst.id}
                      style={{
                        borderTop: i === 0 ? undefined : "1px solid #f0f0f0",
                        background: inst.status === "FLAGGED" ? "#fffbf5" : undefined,
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-sm" style={{ color: "#222733" }}>{inst.template.name}</p>
                        {overdue && (
                          <p className="text-xs mt-0.5 font-medium" style={{ color: "#dc2626" }}>⚠ Overdue</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs font-mono font-semibold" style={{ color: "#006bb7" }}>
                          {inst.template.code}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: overdue ? "#dc2626" : "#6c757d" }}>
                        {new Date(inst.deadline).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inst.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {canOpen ? (
                          <Link
                            href={`/dashboard/licensee/instances/${inst.id}/runner`}
                            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                            style={{ color: inst.status === "FLAGGED" ? "#c2410c" : "#006bb7" }}
                          >
                            {inst.status === "FLAGGED" ? "Address feedback" : "Open runner"}
                            <ArrowRight size={12} />
                          </Link>
                        ) : inst.status === "SUBMITTED" ? (
                          <span className="text-xs" style={{ color: "#9ca3af" }}>Awaiting review</span>
                        ) : inst.status === "APPROVED" ? (
                          <Link
                            href={`/dashboard/licensee/instances/${inst.id}/runner`}
                            className="text-xs hover:underline"
                            style={{ color: "#6c757d" }}
                          >
                            View details
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/licensee/instances/${inst.id}/runner`}
                            className="text-xs hover:underline"
                            style={{ color: "#6c757d" }}
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
