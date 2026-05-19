"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Layers, ClipboardCheck, Fingerprint, Lock, Eye } from "lucide-react";

const lifecycleSteps = [
  {
    number: "01",
    title: "Provisioning",
    description:
      "A BOBS Administrator selects a service template and assigns it to your organisation with a compliance deadline.",
    icon: <Layers className="w-5 h-5" />,
    color: "#006bb7",
  },
  {
    number: "02",
    title: "Guided Data Entry",
    description:
      "The Instance Runner presents a structured form. Every field, file requirement, and validation rule is defined upfront — no guesswork, no back-and-forth emails.",
    icon: <ClipboardCheck className="w-5 h-5" />,
    color: "#72bf40",
  },
  {
    number: "03",
    title: "Integrity Verification",
    description:
      "Documents are SHA-256 hashed on upload. The system verifies nothing was altered in transit and validates your data against the template schema in real-time.",
    icon: <Fingerprint className="w-5 h-5" />,
    color: "#f5a623",
  },
  {
    number: "04",
    title: "Sign & Submit",
    description:
      "A JWT-signed digital receipt is generated, cryptographically binding the submission to your organisation. Data moves to the immutable compliance vault.",
    icon: <Lock className="w-5 h-5" />,
    color: "#e07b39",
  },
  {
    number: "05",
    title: "BOBS Review",
    description:
      "BOBS Officers review your submission with full access to all data, documents, and automated analytics. Approve, flag for correction, or reject with notes.",
    icon: <Eye className="w-5 h-5" />,
    color: "#213976",
  },
];

const matrixSamples = [
  { code: "QMS", label: "Quality Management", example: "ISO 9001 surveillance for a food manufacturer" },
  { code: "PROD", label: "Product Certification", example: "Standard Mark application for bottled water" },
  { code: "IMPORT", label: "Import Inspection", example: "Certificate of Conformity for imported cement" },
  { code: "CALIB", label: "Metrology & Calibration", example: "Calibration request for weighing instruments" },
];

function Collapsible({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #d9dde3" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h3 className="text-lg font-bold" style={{ color: "#213976" }}>{title}</h3>
          <p className="text-sm mt-0.5" style={{ color: "#6c757d" }}>{subtitle}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300"
          style={{
            background: "#edf3f9",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: "#006bb7" }} />
        </div>
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function InstanceExplainer() {
  return (
    <section id="how-it-works" className="py-20 scroll-mt-16" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ background: "#edf3f9", color: "#006bb7" }}
          >
            How Instances works
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#213976" }}>
            From paper forms to a structured digital workflow
          </h2>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed" style={{ color: "#6c757d" }}>
            BOBS Instances replaces the slow, error-prone cycle of emailed PDFs and manual tracking
            with guided, verifiable compliance submissions.
          </p>
        </div>

        {/* Before / After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-xl p-6" style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#991b1b" }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#fecaca", color: "#991b1b" }}>✕</span>
              The old way
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "#b91c1c" }}>
              {[
                "Email forms with no version control or audit trail",
                "Manual data re-entry by BOBS staff from PDFs",
                "Weeks of back-and-forth for missing documents",
                "No visibility on submission status for companies",
                "Lost submissions and duplicated effort",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">—</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-6" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#166534" }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#bbf7d0", color: "#166534" }}>✓</span>
              The Instances way
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: "#15803d" }}>
              {[
                "Structured, schema-validated submissions every time",
                "Real-time status tracking from your dashboard",
                "Cryptographic receipts prove what was submitted and when",
                "Instant notification when BOBS reviews your filing",
                "Full audit trail — nothing is lost or altered",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Collapsibles */}
        <div className="space-y-4">
          <Collapsible
            title="The 5-step compliance lifecycle"
            subtitle="From assignment to BOBS decision — click to explore each step"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {lifecycleSteps.map((step, i) => (
                <div key={step.number} className="relative">
                  <div className="rounded-xl p-5 h-full" style={{ background: "#f4f6f9", border: "1px solid #d9dde3" }}>
                    <div
                      className="w-10 h-10 rounded-lg text-white flex items-center justify-center mb-3"
                      style={{ background: step.color }}
                    >
                      {step.icon}
                    </div>
                    <div className="text-xs font-mono mb-1" style={{ color: "#9ca3af" }}>Step {step.number}</div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: "#213976" }}>{step.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: "#6c757d" }}>{step.description}</p>
                  </div>
                  {i < lifecycleSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible
            title="Service templates & classification"
            subtitle="Each BOBS service has a tailored template — click to see examples"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {matrixSamples.map((m) => (
                <div key={m.code} className="rounded-lg p-4" style={{ background: "#f4f6f9", border: "1px solid #d9dde3" }}>
                  <span className="font-mono font-bold text-lg" style={{ color: "#006bb7" }}>{m.code}</span>
                  <p className="text-sm font-medium mt-1" style={{ color: "#213976" }}>{m.label}</p>
                  <p className="text-xs mt-1" style={{ color: "#6c757d" }}>{m.example}</p>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: "#006bb7" }}
            >
              Sign in to see all templates <ArrowRight className="w-3 h-3" />
            </Link>
          </Collapsible>
        </div>

        {/* CTA panel */}
        <div className="mt-10 rounded-2xl p-8 text-white" style={{ background: "#213976" }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-3">Your organisation, already in the system</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                BOBS has provisioned Instances accounts for certified organisations and licensed importers.
                Sign in with your credentials to access your Instances dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-white text-center justify-center hover:opacity-90 transition"
                style={{ background: "#72bf40" }}
              >
                Access your portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
