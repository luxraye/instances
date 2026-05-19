import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TemplateForm } from "./template-form";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PUBLISHED: { bg: "#dcfce7", color: "#166534" },
  DRAFT:     { bg: "#dbeafe", color: "#1d4ed8" },
  ARCHIVED:  { bg: "#f3f4f6", color: "#6b7280" },
};

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN") redirect("/dashboard/admin");

  const templates = await prisma.template.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ code: "asc" }, { version: "desc" }],
  });

  const published = templates.filter((t) => t.status === "PUBLISHED").length;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Templates</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Define service templates using JSON Schema. Published templates can be provisioned to licensees.
          {templates.length > 0 && (
            <span className="ml-2 font-medium" style={{ color: "#213976" }}>
              {published} published of {templates.length}
            </span>
          )}
        </p>
      </div>

      <TemplateForm />

      {templates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>
              All templates ({templates.length})
            </h2>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: "#d9dde3" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d9dde3" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Version</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Published</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t, i) => {
                  const s = STATUS_STYLES[t.status] ?? STATUS_STYLES.ARCHIVED;
                  return (
                    <tr key={t.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f0f0f0" }}>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs font-semibold" style={{ color: "#213976" }}>{t.code}</code>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "#222733" }}>{t.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6c757d" }}>v{t.version}</td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6c757d" }}>
                        {t.publishedAt
                          ? new Date(t.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
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
