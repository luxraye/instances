// src/components/layout/dashboard-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileBox, ClipboardCheck, BarChart3,
  Layers, Grid3X3, Key, Landmark, BookOpen, LogOut,
  ChevronLeft, ChevronRight, PlusCircle, FlaskConical, Play,
} from "lucide-react";
import { useState } from "react";

interface NavItem { href: string; label: string; icon: React.ReactNode }
interface NavGroup { title: string; items: NavItem[] }

const licenseeNav: NavGroup[] = [
  {
    title: "My workspace",
    items: [
      { href: "/dashboard/licensee", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/licensee/instances", label: "My Instances", icon: <FileBox size={18} /> },
      { href: "/dashboard/licensee/playground", label: "Instances Playground", icon: <FlaskConical size={18} /> },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/dashboard/standards", label: "Standards Catalogue", icon: <BookOpen size={18} /> },
      { href: "/dashboard/legacy", label: "Legacy Services", icon: <Landmark size={18} /> },
    ],
  },
];

const reviewerNav: NavGroup[] = [
  {
    title: "Review",
    items: [
      { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/admin/review", label: "Review Queue", icon: <ClipboardCheck size={18} /> },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/dashboard/standards", label: "Standards", icon: <BookOpen size={18} /> },
      { href: "/dashboard/legacy", label: "Legacy Services", icon: <Landmark size={18} /> },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { href: "/dashboard/admin", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { href: "/dashboard/admin/instances", label: "All Submissions", icon: <FileBox size={18} /> },
      { href: "/dashboard/admin/review", label: "Review Queue", icon: <ClipboardCheck size={18} /> },
      { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/dashboard/admin/templates", label: "Templates", icon: <Layers size={18} /> },
      { href: "/dashboard/admin/matrix", label: "Classification Matrix", icon: <Grid3X3 size={18} /> },
      { href: "/dashboard/admin/api-keys", label: "API Keys", icon: <Key size={18} /> },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/dashboard/licensee/playground", label: "Instances Playground", icon: <FlaskConical size={18} /> },
      { href: "/dashboard/standards", label: "Standards", icon: <BookOpen size={18} /> },
      { href: "/dashboard/legacy", label: "Legacy Services", icon: <Landmark size={18} /> },
    ],
  },
];

interface Props {
  role: string;
  userName: string;
  userEmail: string;
}

export function DashboardSidebar({ role, userName, userEmail }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const groups =
    role === "TENANT_ADMIN" ? adminNav :
    role === "REVIEWER" ? reviewerNav :
    licenseeNav;

  const overviewExact = ["/dashboard/admin", "/dashboard/licensee"];

  function isActive(href: string) {
    if (overviewExact.includes(href)) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-200"
      style={{
        background: "#213976",
        width: collapsed ? "64px" : "240px",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white"
              style={{ background: "#72bf40" }}
            >
              BOBS
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-tight truncate">Bureau of Standards</p>
              <p className="text-xs truncate" style={{ color: "#93b4d4" }}>Instances</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white mx-auto"
            style={{ background: "#72bf40" }}
          >
            B
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          style={collapsed ? { margin: "0 auto", display: "block" } : {}}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p
                className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                    style={
                      active
                        ? { background: "#006bb7", color: "#ffffff" }
                        : { color: "rgba(255,255,255,0.7)" }
                    }
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Provision shortcut for admin */}
        {role === "TENANT_ADMIN" && !collapsed && (
          <div>
            <p
              className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Quick actions
            </p>
            <Link
              href="/dashboard/admin/instances"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <PlusCircle size={18} className="flex-shrink-0" />
              <span>Provision submission</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        {!collapsed && (
          <div className="mb-2">
            <p className="text-xs font-medium text-white truncate">{userName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{userEmail}</p>
            <p
              className="text-xs mt-0.5 capitalize font-medium"
              style={{ color: "#72bf40" }}
            >
              {role === "TENANT_ADMIN" ? "Administrator" : role === "REVIEWER" ? "Reviewer" : "Licensee"}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? "Sign out" : undefined}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "white";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
          }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
