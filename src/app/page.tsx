import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { InstanceExplainer } from "@/components/home/instance-explainer";
import { Lock, Fingerprint, Eye, FileCheck, ArrowRight } from "lucide-react";

const services = [
  {
    code: "QMS",
    title: "ISO 9001 Certification",
    desc: "Apply for initial certification or submit annual surveillance reports for your Quality Management System.",
    color: "#006bb7",
  },
  {
    code: "PROD",
    title: "Product Standard Mark",
    desc: "Apply for a licence to carry the BOBS Standard Mark on locally manufactured or imported products.",
    color: "#72bf40",
  },
  {
    code: "IMPORT",
    title: "Import Inspection (CoC)",
    desc: "Request Certificates of Conformity for controlled products under the Import Inspection Regulations.",
    color: "#213976",
  },
  {
    code: "CALIB",
    title: "Metrology & Calibration",
    desc: "Submit calibration service requests for measuring instruments — SADCAS-accredited results.",
    color: "#f5a623",
  },
  {
    code: "STD",
    title: "Standards Public Comment",
    desc: "Participate in the development of Botswana Standards by submitting comments on draft standards.",
    color: "#e07b39",
  },
  {
    code: "LEGACY",
    title: "Legacy Services Bridge",
    desc: "Access existing BOBS services — webstore, certification register, training registration — in one view.",
    color: "#6c757d",
  },
];

const securityPillars = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Zero-Trust Files",
    desc: "SHA-256 hashing on client and server. Altered documents are rejected automatically.",
    accent: "#006bb7",
  },
  {
    icon: <Fingerprint className="w-5 h-5" />,
    title: "Digital Signatures",
    desc: "JWT-signed receipts cryptographically bind each submission to your organisation.",
    accent: "#72bf40",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Real-time Oversight",
    desc: "BOBS dashboards update the moment data is submitted. No more waiting weeks.",
    accent: "#f5a623",
  },
  {
    icon: <FileCheck className="w-5 h-5" />,
    title: "Immutable Vault",
    desc: "Submitted data cannot be altered. Full audit trail for every action.",
    accent: "#e07b39",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#f4f6f9" }}>
      <PublicHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #1a2f66 0%, #213976 50%, #1a4a9c 100%)" }}
      >
        {/* subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* decorative accent circle */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "#72bf40" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16 lg:pt-28 lg:pb-20">
          <p
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(114,191,64,0.15)",
              border: "1px solid rgba(114,191,64,0.45)",
              color: "#a8e06a",
              letterSpacing: "0.12em",
            }}
          >
            Digital Regulatory Compliance Platform
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Structured. Auditable.<br />
            <span style={{ color: "#72bf40" }}>Built for Botswana.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg lg:text-xl leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.78)" }}>
            BOBS Instances replaces paper-based and email-driven compliance workflows with a single
            secure platform — from certification applications to import inspections and calibration requests.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              href="#how-it-works"
              className="rounded-lg px-7 py-3.5 font-semibold text-white transition hover:opacity-90"
              style={{ background: "#006bb7" }}
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="rounded-lg border px-7 py-3.5 font-semibold transition hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.9)" }}
            >
              Sign in to your portal
            </Link>
          </div>

          {/* ── Stats band — inside hero, separated by a subtle line ── */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}
          >
            {[
              { n: "6+",     label: "Service Types",            sub: "QMS · PROD · IMPORT · CALIB · STD · LEGACY" },
              { n: "100+",   label: "Certified Organisations",  sub: "Active licence holders" },
              { n: "4",      label: "User Roles",               sub: "Platform · Admin · Reviewer · Licensee" },
              { n: "SADCAS", label: "Accredited Labs",          sub: "Calibration & metrology" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center px-4 py-7 text-white"
                style={{
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : undefined,
                }}
              >
                <p className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: "#72bf40" }}>{s.n}</p>
                <p className="text-sm font-semibold mb-1">{s.label}</p>
                <p className="text-xs text-center leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instance Explainer ────────────────────────────────────────────── */}
      <InstanceExplainer />

      {/* ── Services grid ─────────────────────────────────────────────────── */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: "#f4f6f9" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#213976" }}>
              Digital services offered
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "#6c757d" }}>
              End-to-end digital workflows for every major BOBS compliance service
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.code}
                className="rounded-xl p-5 bg-white"
                style={{ border: "1px solid #d9dde3" }}
              >
                <span
                  className="inline-block font-mono font-bold text-xs rounded px-2 py-0.5 mb-3"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.code}
                </span>
                <h3 className="font-semibold text-sm mb-1.5" style={{ color: "#213976" }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#6c757d" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security pillars ──────────────────────────────────────────────── */}
      <section style={{ background: "#213976" }} className="py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#72bf40" }}>
            Data integrity by design
          </p>
          <h2 className="text-3xl font-bold mb-3">Trust the process, not the paperwork</h2>
          <p className="max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Because compliance data is self-reported, our security model ensures integrity at every step —
            so BOBS can focus on <strong className="text-white">verification and validation</strong>, not data collection.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {securityPillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${p.accent}44` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${p.accent}22`, color: p.accent }}
                >
                  {p.icon}
                </div>
                <h4 className="font-semibold mb-1">{p.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legacy portal CTA ─────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-2xl p-8 text-white text-center"
            style={{ background: "linear-gradient(135deg, #213976 0%, #006bb7 100%)" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                Smooth transition
              </p>
              <h2 className="text-2xl font-bold mb-3">All your BOBS services, still here</h2>
              <p className="max-w-xl mx-auto mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                BOBS is transitioning to this modern platform but all legacy services — standards webstore,
                certification register, training, tenders — remain accessible in one organised view.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-semibold hover:bg-white/90 transition-colors"
                style={{ color: "#213976" }}
              >
                Access Legacy Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
