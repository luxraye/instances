"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Landmark } from "lucide-react";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/dashboard/standards", label: "Standards" },
  { href: "/dashboard/legacy", label: "Legacy Portal" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ background: "#213976", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* utility bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Botswana Bureau of Standards — Accreditation · Certification · Standards
          </span>
          <div className="hidden sm:flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <a href="tel:+26731700851" className="hover:text-white transition-colors">+267 317 0085</a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <a href="mailto:info@bobstandards.bw" className="hover:text-white transition-colors">info@bobstandards.bw</a>
          </div>
        </div>
      </div>

      {/* main nav */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded font-bold text-white text-xs flex-shrink-0"
              style={{ background: "#72bf40" }}
            >
              BOBS
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Botswana Bureau of Standards</p>
              <p className="text-xs" style={{ color: "#93b4d4" }}>Instances Portal</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard/legacy"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Landmark className="w-3.5 h-3.5" />
              Legacy Services
            </Link>
            <Link
              href="/login"
              className="ml-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#006bb7" }}
            >
              Sign in
            </Link>
          </nav>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav className="lg:hidden pb-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block px-3 py-2 mt-2 rounded-md text-sm font-semibold text-white text-center"
              style={{ background: "#006bb7" }}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
