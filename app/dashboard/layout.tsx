"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BrandMark from "../components/BrandMark";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/configurator", label: "Configurator" },
  { href: "/dashboard/finance", label: "Finance" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="page-shell min-h-screen text-white">
      <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
        <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="glass-panel-soft sticky top-4 rounded-[30px] p-5">
              <div className="border-b border-white/10 pb-5">
                <BrandMark href="/dashboard" subtitle="Operations Dashboard" size="md" />
              </div>

              <nav className="mt-5 space-y-3">
                {navItems.map((item, index) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`step-rail-item ${active ? "step-rail-item-active" : ""}`}
                    >
                      <div className={`step-badge ${active ? "step-badge-active" : ""}`}>
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-base font-bold text-white">
                          {item.label}
                        </div>
                        <div className="mt-1 truncate text-sm text-zinc-500">
                          {item.href.replace("/", "") || "dashboard"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  System Status
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-200">
                  Dashboard active
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="glass-panel-soft mb-4 rounded-[22px] p-3 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <BrandMark href="/dashboard" subtitle="Operations" size="sm" />
                </div>

                <Link href="/" className="ui-btn shrink-0">
                  Home
                </Link>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-300"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel-soft rounded-[26px] p-4 md:p-5 lg:rounded-[30px] lg:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
