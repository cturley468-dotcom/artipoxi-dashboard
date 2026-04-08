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
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="glass-panel-soft sticky top-4 rounded-[30px] p-5">
              <div className="border-b border-white/10 pb-5">
                <BrandMark
                  href="/dashboard"
                  subtitle="Operations Dashboard"
                  size="md"
                />
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
                      className={`step-rail-item ${
                        active ? "step-rail-item-active" : ""
                      }`}
                    >
                      <div
                        className={`step-badge ${
                          active ? "step-badge-active" : ""
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-base font-bold ${
                            active ? "text-cyan-300" : "text-white"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
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
                <div className="mt-3 text-sm font-semibold text-lime-300">
                  Dashboard active
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="glass-panel-soft mb-4 rounded-[22px] p-3 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <BrandMark
                  href="/dashboard"
                  subtitle="Operations"
                  size="sm"
                />

                <Link
                  href="/"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white"
                >
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
                          ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-300"
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
