"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const found = navItems.find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)
    );
    return found?.label || "Dashboard";
  }, [pathname]);

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
        <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="glass-panel-soft sticky top-4 rounded-[28px] p-5">
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
            <div className="glass-panel-soft mb-4 flex items-center justify-between rounded-[22px] px-4 py-3 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white"
              >
                Menu
              </button>

              <div className="min-w-0 text-center">
                <div className="truncate text-sm font-bold text-white">
                  {pageTitle}
                </div>
              </div>

              <Link
                href="/"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white"
              >
                Home
              </Link>
            </div>

            <div className="glass-panel-soft rounded-[26px] p-4 md:p-5 lg:rounded-[30px] lg:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-[360px] overflow-y-auto border-r border-white/10 bg-[#070b12] p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <BrandMark
                href="/dashboard"
                subtitle="Operations Dashboard"
                size="sm"
              />

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
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
                    onClick={() => setMobileMenuOpen(false)}
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
        </div>
      )}
    </main>
  );
}
