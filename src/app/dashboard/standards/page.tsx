import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Standard = {
  ref: string;
  title: string;
  sector: string;
  status: "Published" | "Under Review" | "Draft";
  year: number;
  iso?: string;
};

const STANDARDS: Standard[] = [
  { ref: "BOS ISO 9001:2015", title: "Quality management systems — Requirements", sector: "Cross-sectoral", status: "Published", year: 2015, iso: "ISO 9001:2015" },
  { ref: "BOS ISO 14001:2015", title: "Environmental management systems — Requirements with guidance for use", sector: "Cross-sectoral", status: "Published", year: 2015, iso: "ISO 14001:2015" },
  { ref: "BOS ISO 45001:2018", title: "Occupational health and safety management systems — Requirements", sector: "Cross-sectoral", status: "Published", year: 2018, iso: "ISO 45001:2018" },
  { ref: "BOS 29:2014", title: "Household and similar electrical appliances — Safety requirements", sector: "Electrical", status: "Published", year: 2014 },
  { ref: "BOS 2:2012", title: "Photovoltaic systems — Design, installation and testing", sector: "Energy", status: "Published", year: 2012 },
  { ref: "BOS ISO 22000:2018", title: "Food safety management systems — Requirements for any organization in the food chain", sector: "Food & Agriculture", status: "Published", year: 2018, iso: "ISO 22000:2018" },
  { ref: "BOS 105:2019", title: "Drinking water — Specifications", sector: "Food & Agriculture", status: "Published", year: 2019 },
  { ref: "BOS 112:2020", title: "Cement — Composition, specifications and conformity criteria", sector: "Construction", status: "Published", year: 2020 },
  { ref: "BOS 78:2016", title: "Steel bars and rods for concrete reinforcement — Specifications", sector: "Construction", status: "Published", year: 2016 },
  { ref: "BOS ISO 17025:2017", title: "General requirements for the competence of testing and calibration laboratories", sector: "Metrology", status: "Published", year: 2017, iso: "ISO/IEC 17025:2017" },
  { ref: "BOS 55:2015", title: "Pre-packaged products — Labelling requirements", sector: "Consumer Protection", status: "Published", year: 2015 },
  { ref: "BOS 89:2018", title: "Fertilizers — Specifications and labelling", sector: "Food & Agriculture", status: "Published", year: 2018 },
  { ref: "BOS 94:2021", title: "Solar water heaters — Performance requirements and test methods", sector: "Energy", status: "Published", year: 2021 },
  { ref: "BOS ISO 50001:2018", title: "Energy management systems — Requirements with guidance for use", sector: "Energy", status: "Published", year: 2018, iso: "ISO 50001:2018" },
  { ref: "BOS 120:2023", title: "Liquefied petroleum gas (LPG) cylinders — Specifications and safety", sector: "Energy", status: "Published", year: 2023 },
  { ref: "BOS 67:2014", title: "Electrical wiring installations in buildings — Code of practice", sector: "Electrical", status: "Published", year: 2014 },
  { ref: "BOS 115:2022", title: "Mobile money services — Security requirements", sector: "Financial Services", status: "Under Review", year: 2022 },
  { ref: "BOS 130:2024", title: "Electric vehicles — Charging infrastructure requirements", sector: "Energy", status: "Draft", year: 2024 },
  { ref: "BOS ISO 27001:2022", title: "Information security management systems — Requirements", sector: "ICT", status: "Published", year: 2022, iso: "ISO/IEC 27001:2022" },
  { ref: "BOS 88:2017", title: "Road vehicles — Roadworthiness inspection requirements", sector: "Transport", status: "Published", year: 2017 },
];

const SECTORS = [...new Set(STANDARDS.map((s) => s.sector))].sort();

export default async function StandardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const published = STANDARDS.filter((s) => s.status === "Published").length;
  const underReview = STANDARDS.filter((s) => s.status === "Under Review").length;
  const draft = STANDARDS.filter((s) => s.status === "Draft").length;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>Standards Catalogue</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Botswana Standards (BOS) published by the Bureau. Purchase via the{" "}
          <a href="https://bobstandards.bw/shop/" target="_blank" rel="noopener" className="hover:underline" style={{ color: "#006bb7" }}>
            BOBS Webstore
          </a>.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Published", count: published, bg: "#dcfce7", color: "#166534" },
          { label: "Under Review", count: underReview, bg: "#dbeafe", color: "#1d4ed8" },
          { label: "Draft", count: draft, bg: "#f3f4f6", color: "#6b7280" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 text-center" style={{ borderColor: "#d9dde3" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: "#6c757d" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* By sector */}
      {SECTORS.map((sector) => {
        const sectorStandards = STANDARDS.filter((s) => s.sector === sector);
        return (
          <section key={sector}>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "#6c757d" }}>
              {sector} ({sectorStandards.length})
            </h2>
            <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: "#d9dde3" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d9dde3" }}>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Reference</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Title</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorStandards.map((std, i) => (
                    <tr key={std.ref} style={{ borderTop: i === 0 ? undefined : "1px solid #f0f0f0" }}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold" style={{ color: "#213976" }}>{std.ref}</p>
                        {std.iso && (
                          <p className="text-xs" style={{ color: "#6c757d" }}>≡ {std.iso}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: "#222733" }}>{std.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={
                            std.status === "Published"
                              ? { background: "#dcfce7", color: "#166534" }
                              : std.status === "Under Review"
                              ? { background: "#dbeafe", color: "#1d4ed8" }
                              : { background: "#f3f4f6", color: "#6b7280" }
                          }
                        >
                          {std.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href="https://bobstandards.bw/shop/"
                          target="_blank"
                          rel="noopener"
                          className="text-xs font-medium hover:underline"
                          style={{ color: "#006bb7" }}
                        >
                          {std.status === "Published" ? "Purchase →" : "Notify me"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <p className="text-xs text-center pb-4" style={{ color: "#9ca3af" }}>
        Showing {STANDARDS.length} of 300+ Botswana Standards. For the complete catalogue,{" "}
        <a
          href="https://bobstandards.bw/wp-content/uploads/2024/06/BOBS-Standards-Catalogue-June-2024.pdf"
          target="_blank"
          rel="noopener"
          className="hover:underline"
          style={{ color: "#006bb7" }}
        >
          download the full PDF catalogue
        </a>.
      </p>
    </div>
  );
}
