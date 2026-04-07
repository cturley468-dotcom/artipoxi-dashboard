"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { playfair } from "../layout";

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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-[1600px] gap-4 px-3 py-3 md:gap-5 md:px-4 md:py-4">
        
        {/* Sidebar */}
        <aside className="sticky top-3 h-[calc(100vh-24px)] w-[210px] shrink-0 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 md:top-4 md:h-[calc(100vh-32px)] md:w-[220px] md:p-5">
          
          {/* 🔥 PREMIUM LOGO */}
          <div className="border-b border-white/10 pb-4">
            <Link href="/dashboard" className="block">
              <div className={`text-3xl tracking-wide ${playfair.className}`}>
                <span className="text-cyan-300">Arti</span>
                <span className="text-white">Poxi</span>
              </div>

              <div className="mt-1 text-sm text-zinc-400">
                Operations Dashboard
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Status */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              System Status
            </div>
            <div className="mt-3 text-sm font-semibold text-lime-300">
              Dashboard active
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.05),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.04),transparent_18%),#0a0a0a] p-4 md:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
