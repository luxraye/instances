import { auth } from "@/auth";
import { redirect } from "next/navigation";

type ServiceStatus = "live" | "bridge" | "coming-soon";

type LegacyService = {
  icon: string;
  title: string;
  description: string;
  status: ServiceStatus;
  url?: string;
  category: string;
};

const SERVICES: LegacyService[] = [
  {
    icon: "🛒",
    title: "Standards Webstore",
    description: "Purchase Botswana Standards, ISO standards, and related publications directly from the BOBS online store.",
    status: "live",
    url: "https://bobstandards.bw/shop/",
    category: "Standards",
  },
  {
    icon: "📋",
    title: "System Certification Register",
    description: "View the public register of organisations currently certified by BOBS under ISO 9001, ISO 14001, ISO 45001, and other schemes.",
    status: "live",
    url: "https://bobstandards.bw/system-certification-register/",
    category: "Certification",
  },
  {
    icon: "💬",
    title: "Standards for Public Comment",
    description: "Access draft Botswana Standards open for public review and download comment templates.",
    status: "bridge",
    url: "https://bobstandards.bw/invitations-for-public-comments/",
    category: "Standards",
  },
  {
    icon: "📚",
    title: "Standards Subscription Portal",
    description: "Manage your organisation's subscription for unlimited access to Botswana Standards publications.",
    status: "live",
    url: "https://bobstandards.bw/standards-subscription-portal/",
    category: "Standards",
  },
  {
    icon: "🏫",
    title: "Training & Certification Services",
    description: "Browse upcoming BOBS training courses — auditor training, ISO awareness, metrology, and more.",
    status: "live",
    url: "https://bobstandards.bw/services/training/",
    category: "Training",
  },
  {
    icon: "🔬",
    title: "Testing of Products",
    description: "Submit products to the BOBS laboratory for testing against Botswana and international specifications.",
    status: "bridge",
    url: "https://bobstandards.bw/testing-of-products/",
    category: "Laboratory",
  },
  {
    icon: "⚖️",
    title: "Calibration Services (Legacy)",
    description: "Use the legacy calibration request form. New requests are now handled through BOBS Instances (Calibration Service Request).",
    status: "bridge",
    url: "https://bobstandards.bw/calibration-services/",
    category: "Laboratory",
  },
  {
    icon: "🌍",
    title: "WTO TBT National Enquiry Point",
    description: "Access information on Technical Barriers to Trade (TBT) notifications relevant to Botswana trade.",
    status: "live",
    url: "https://bobstandards.bw/wto-tbt-national-enquiry-point/",
    category: "Trade Facilitation",
  },
  {
    icon: "📦",
    title: "Import Inspection (SIIR) — Legacy",
    description: "Legacy portal for BOBS-recognised inspection body coordination. Full digital workflow is now available in Instances.",
    status: "bridge",
    url: "https://bobstandards.bw/",
    category: "Import Inspection",
  },
  {
    icon: "📰",
    title: "Press Releases & Public Notices",
    description: "Stay up to date with announcements, new standards, regulatory notices, and BOBS news.",
    status: "live",
    url: "https://bobstandards.bw/press-releases/",
    category: "Media Centre",
  },
  {
    icon: "📅",
    title: "Events & Upcoming Training",
    description: "View the BOBS events calendar for workshops, seminars, and industry engagement sessions.",
    status: "live",
    url: "https://bobstandards.bw/events/",
    category: "Media Centre",
  },
  {
    icon: "🏛️",
    title: "Information Centre",
    description: "Access the BOBS library and information resources including standards catalogues and technical guidance.",
    status: "live",
    url: "https://bobstandards.bw/information-centre/",
    category: "Trade Facilitation",
  },
  {
    icon: "🎓",
    title: "Standards Catalogue (PDF)",
    description: "Download the full Botswana Standards Catalogue (June 2024) listing all published Botswana Standards by sector.",
    status: "live",
    url: "https://bobstandards.bw/wp-content/uploads/2024/06/BOBS-Standards-Catalogue-June-2024.pdf",
    category: "Standards",
  },
  {
    icon: "🏗️",
    title: "Regulation of Compulsory Standards",
    description: "Information on products and services subject to mandatory compliance under Botswana compulsory standards.",
    status: "live",
    url: "https://bobstandards.bw/regulation-of-compulsory-standards/",
    category: "Regulatory",
  },
  {
    icon: "🏢",
    title: "Facilities Hire",
    description: "Book BOBS conference facilities and training rooms in Gaborone.",
    status: "live",
    url: "https://bobstandards.bw/facilities-hire-cafeteria/",
    category: "Facilities",
  },
];

const STATUS_LABELS: Record<ServiceStatus, string> = {
  live: "Live",
  bridge: "Bridged via Instances",
  "coming-soon": "Coming Soon",
};

const STATUS_STYLES: Record<ServiceStatus, { bg: string; color: string; border: string }> = {
  live: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  bridge: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  "coming-soon": { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

const categories = [...new Set(SERVICES.map((s) => s.category))];

export default async function LegacyServicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Legacy Services Portal</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Access all existing BOBS services from a single hub. Bridged services are now fully integrated
          into this platform — use the Instances workflow for new submissions.
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {(["live", "bridge", "coming-soon"] as ServiceStatus[]).map((s) => {
          const style = STATUS_STYLES[s];
          return (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border"
              style={{ background: style.bg, color: style.color, borderColor: style.border }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: style.color }}
              />
              {STATUS_LABELS[s]}
            </span>
          );
        })}
      </div>

      {/* Services by category */}
      {categories.map((cat) => {
        const catServices = SERVICES.filter((s) => s.category === cat);
        return (
          <section key={cat}>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "#6c757d" }}>
              {cat}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catServices.map((svc) => {
                const style = STATUS_STYLES[svc.status];
                return (
                  <div
                    key={svc.title}
                    className="rounded-xl border bg-white p-5 flex flex-col"
                    style={{ borderColor: "#d9dde3" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{svc.icon}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium border"
                        style={{ background: style.bg, color: style.color, borderColor: style.border }}
                      >
                        {STATUS_LABELS[svc.status]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "#213976" }}>{svc.title}</h3>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "#6c757d" }}>{svc.description}</p>
                    {svc.url && svc.status !== "coming-soon" && (
                      <a
                        href={svc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-xs font-medium hover:underline"
                        style={{ color: "#006bb7" }}
                      >
                        {svc.status === "bridge" ? "Open legacy portal →" : "Open →"}
                      </a>
                    )}
                    {svc.status === "coming-soon" && (
                      <p className="mt-4 text-xs" style={{ color: "#9ca3af" }}>Available in a future release</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Integration note */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "#edf3f9", borderColor: "#006bb7" }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: "#213976" }}>
          About the Legacy Services Portal
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>
          Services marked <strong>Bridged via Instances</strong> are in transition — the legacy URL remains
          operational, but new requests are now processed through this platform&apos;s structured workflow.
          Bridged services benefit from digital audit trails, structured payloads, file integrity verification,
          and reviewer decision workflows. Contact the BOBS Instances team to migrate additional services.
        </p>
      </div>
    </div>
  );
}
