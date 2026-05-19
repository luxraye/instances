import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN" && session.user.role !== "REVIEWER") redirect("/dashboard");

  const tid = session.user.tenantId;

  const [allInstances, templates, users] = await Promise.all([
    prisma.instance.findMany({
      where: { tenantId: tid },
      include: {
        template: { select: { name: true, code: true } },
        assignee: { select: { name: true } },
      },
    }),
    prisma.template.findMany({ where: { tenantId: tid } }),
    prisma.user.findMany({ where: { tenantId: tid, role: "LICENSEE" } }),
  ]);

  const total = allInstances.length;
  const byStatus = {
    PENDING: allInstances.filter((i) => i.status === "PENDING").length,
    IN_PROGRESS: allInstances.filter((i) => i.status === "IN_PROGRESS").length,
    SUBMITTED: allInstances.filter((i) => i.status === "SUBMITTED").length,
    APPROVED: allInstances.filter((i) => i.status === "APPROVED").length,
    FLAGGED: allInstances.filter((i) => i.status === "FLAGGED").length,
    REJECTED: allInstances.filter((i) => i.status === "REJECTED").length,
  };

  // By template
  const byTemplate = templates.map((t) => {
    const count = allInstances.filter((i) => i.templateId === t.id).length;
    return { name: t.name, code: t.code, count };
  }).sort((a, b) => b.count - a.count);

  // Completion rate
  const completionRate = total > 0 ? Math.round(((byStatus.APPROVED) / total) * 100) : 0;
  const submissionRate = total > 0 ? Math.round(((byStatus.APPROVED + byStatus.SUBMITTED + byStatus.FLAGGED) / total) * 100) : 0;
  const flagRate = total > 0 ? Math.round(((byStatus.FLAGGED) / total) * 100) : 0;

  // Overdue
  const overdue = allInstances.filter(
    (i) => ["PENDING", "IN_PROGRESS"].includes(i.status) && new Date(i.deadline) < new Date()
  ).length;

  const statusConfig = [
    { key: "APPROVED", label: "Approved", color: "#16a34a" },
    { key: "SUBMITTED", label: "Submitted", color: "#7c3aed" },
    { key: "IN_PROGRESS", label: "In Progress", color: "#2563eb" },
    { key: "FLAGGED", label: "Flagged", color: "#ea580c" },
    { key: "PENDING", label: "Pending", color: "#ca8a04" },
    { key: "REJECTED", label: "Rejected", color: "#dc2626" },
  ] as const;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Reports & Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
            Compliance operations summary — Botswana Bureau of Standards
          </p>
        </div>
        <span className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: "#d9dde3", color: "#6c757d" }}>
          As of {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total submissions", value: total, sub: "All time" },
          { label: "Registered licensees", value: users.length, sub: "Active accounts" },
          { label: "Completion rate", value: `${completionRate}%`, sub: "Approved / Total" },
          { label: "Overdue", value: overdue, sub: "Unsubmitted past deadline" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
            <p className="text-2xl font-bold" style={{ color: "#213976" }}>{k.value}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: "#222733" }}>{k.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown */}
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#213976" }}>Submissions by status</h2>
          <div className="space-y-3">
            {statusConfig.map(({ key, label, color }) => {
              const count = byStatus[key as keyof typeof byStatus];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#374151" }}>{label}</span>
                    <span className="font-semibold" style={{ color }}>{count} ({pct}%)</span>
                  </div>
                  <Bar pct={pct} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Rates */}
        <div className="rounded-xl border bg-white p-5 space-y-5" style={{ borderColor: "#d9dde3" }}>
          <h2 className="text-base font-semibold" style={{ color: "#213976" }}>Performance indicators</h2>

          {[
            { label: "Submission rate", value: submissionRate, desc: "Submissions started and submitted vs total assigned", color: "#2563eb" },
            { label: "Approval rate", value: completionRate, desc: "Submissions approved as a proportion of all submissions", color: "#16a34a" },
            { label: "Flag rate", value: flagRate, desc: "Submissions returned for revision", color: "#ea580c" },
          ].map((ind) => (
            <div key={ind.label}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium" style={{ color: "#222733" }}>{ind.label}</span>
                <span className="text-lg font-bold" style={{ color: ind.color }}>{ind.value}%</span>
              </div>
              <Bar pct={ind.value} color={ind.color} />
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{ind.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By template */}
      <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#213976" }}>Submissions by service type</h2>
        {byTemplate.length === 0 ? (
          <p className="text-sm" style={{ color: "#6c757d" }}>No data yet.</p>
        ) : (
          <div className="space-y-3">
            {byTemplate.map((t) => {
              const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
              return (
                <div key={t.code}>
                  <div className="flex justify-between text-xs mb-1">
                    <div>
                      <span className="font-medium" style={{ color: "#374151" }}>{t.name}</span>
                      <span className="ml-2 font-mono" style={{ color: "#9ca3af" }}>{t.code}</span>
                    </div>
                    <span className="font-semibold" style={{ color: "#213976" }}>{t.count}</span>
                  </div>
                  <Bar pct={pct} color="#006bb7" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export note */}
      <div
        className="rounded-xl border p-4 text-sm"
        style={{ background: "#edf3f9", borderColor: "#006bb7", color: "#374151" }}
      >
        <strong style={{ color: "#213976" }}>Export:</strong> Full data export to CSV/Excel and scheduled report delivery
        will be available via the API keys integration. Contact the BOBS Instances team to enable reporting webhooks.
      </div>
    </div>
  );
}
