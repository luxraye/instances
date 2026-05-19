import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileBox, Clock, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Landmark } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    PENDING:     { label: "Pending",         bg: "#fef3c7", color: "#92400e" },
    IN_PROGRESS: { label: "In Progress",     bg: "#dbeafe", color: "#1d4ed8" },
    SUBMITTED:   { label: "Submitted",       bg: "#ede9fe", color: "#5b21b6" },
    APPROVED:    { label: "Approved",        bg: "#dcfce7", color: "#166534" },
    FLAGGED:     { label: "Action Required", bg: "#ffedd5", color: "#c2410c" },
    REJECTED:    { label: "Rejected",        bg: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default async function LicenseeDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instances = await prisma.instance.findMany({
    where: { assigneeId: session.user.id },
    include: { template: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total:    instances.length,
    active:   instances.filter((i) => ["PENDING", "IN_PROGRESS"].includes(i.status)).length,
    approved: instances.filter((i) => i.status === "APPROVED").length,
    flagged:  instances.filter((i) => ["FLAGGED", "REJECTED"].includes(i.status)).length,
  };

  const recent = instances.slice(0, 5);
  const flagged = instances.filter((i) => i.status === "FLAGGED");

  return (
    <div className="max-w-4xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>
          Welcome, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          {session.user.email} — Licensee Portal
        </p>
      </div>

      {/* Action required banner */}
      {flagged.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: "#fffbf5", border: "1px solid #fed7aa" }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} style={{ color: "#c2410c" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#c2410c" }}>
                {flagged.length} submission{flagged.length !== 1 ? "s" : ""} require{flagged.length === 1 ? "s" : ""} your attention
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9a3412" }}>
                BOBS has flagged these with review notes. Please respond.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/licensee/instances"
            className="flex items-center gap-1 text-xs font-semibold hover:underline flex-shrink-0"
            style={{ color: "#c2410c" }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total submissions", value: stats.total,    icon: <FileBox size={20} />,      color: "#006bb7" },
          { label: "Active",            value: stats.active,   icon: <Clock size={20} />,         color: "#f5a623" },
          { label: "Approved",          value: stats.approved, icon: <CheckCircle2 size={20} />,  color: "#72bf40" },
          { label: "Needs action",      value: stats.flagged,  icon: <AlertTriangle size={20} />, color: "#e07b39" },
        ].map((s) => (
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

      {/* Recent submissions */}
      <div className="rounded-xl bg-white overflow-hidden" style={{ border: "1px solid #d9dde3" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #d9dde3" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>Recent submissions</h2>
          <Link
            href="/dashboard/licensee/instances"
            className="text-xs font-medium hover:underline flex items-center gap-1"
            style={{ color: "#006bb7" }}
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FileBox size={32} className="mx-auto mb-2" style={{ color: "#d9dde3" }} />
            <p className="text-sm" style={{ color: "#6c757d" }}>No submissions assigned yet.</p>
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>BOBS will assign compliance tasks to your account.</p>
          </div>
        ) : (
          <div>
            {recent.map((inst, i) => {
              const canOpen = ["PENDING", "IN_PROGRESS", "FLAGGED"].includes(inst.status);
              return (
                <div
                  key={inst.id}
                  className="px-5 py-4 flex items-center justify-between"
                  style={{
                    borderTop: i === 0 ? undefined : "1px solid #f0f0f0",
                    background: inst.status === "FLAGGED" ? "#fffbf5" : undefined,
                    borderLeft: inst.status === "FLAGGED" ? "3px solid #f97316" : undefined,
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#222733" }}>{inst.template.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      <code className="font-mono">{inst.template.code}</code>
                      {" · "}Due {new Date(inst.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <StatusBadge status={inst.status} />
                    {canOpen && (
                      <Link
                        href={`/dashboard/licensee/instances/${inst.id}/runner`}
                        className="text-xs font-medium hover:underline flex items-center gap-1"
                        style={{ color: inst.status === "FLAGGED" ? "#c2410c" : "#006bb7" }}
                      >
                        Open <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/standards"
          className="rounded-xl bg-white p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          style={{ border: "1px solid #d9dde3" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#edf3f9", color: "#006bb7" }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#213976" }}>Standards Catalogue</p>
            <p className="text-xs mt-0.5" style={{ color: "#6c757d" }}>Browse published BOS standards by sector</p>
          </div>
          <ArrowRight size={16} className="ml-auto flex-shrink-0" style={{ color: "#d9dde3" }} />
        </Link>
        <Link
          href="/dashboard/legacy"
          className="rounded-xl bg-white p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          style={{ border: "1px solid #d9dde3" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#edf3f9", color: "#006bb7" }}>
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#213976" }}>Legacy Services</p>
            <p className="text-xs mt-0.5" style={{ color: "#6c757d" }}>Webstore, certification register, training</p>
          </div>
          <ArrowRight size={16} className="ml-auto flex-shrink-0" style={{ color: "#d9dde3" }} />
        </Link>
      </div>
    </div>
  );
}
