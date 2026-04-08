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
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="app-shell min-h-screen text-white">
      <div className="mx-auto flex max-w-[1700px] gap-4 px-3 py-3 md:gap-5 md:px-4 md:py-4">
        <aside className="glass-panel cyber-outline sticky top-3 h-[calc(100vh-24px)] w-[250px] shrink-0 rounded-[28px] p-4 md:top-4 md:h-[calc(100vh-32px)] md:w-[270px] md:p-5">
          <div className="border-b border-white/10 pb-4">
            <BrandMark href="/dashboard" subtitle="Operations Dashboard" size="md" />
          </div>

          <div className="mt-5 space-y-3">
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
                  } transition`}
                >
                  <div
                    className={`step-badge ${
                      active ? "step-badge-active" : ""
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <div
                      className={`text-sm font-bold ${
                        active ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {item.href.replace("/", "") || "dashboard"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              System Status
            </div>
            <div className="mt-3 text-sm font-semibold text-lime-300">
              Dashboard active
            </div>
            <div className="mt-3 neon-line" />
          </div>
        </aside>

        <section className="glass-panel cyber-outline min-w-0 flex-1 rounded-[30px] p-4 md:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}