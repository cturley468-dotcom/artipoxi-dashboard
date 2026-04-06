import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/configurator", label: "Configurator" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-zinc-950 p-6">
          <div className="mb-8">
            <h1 className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-4xl font-bold text-transparent">
              ArtiPoxi
            </h1>
            <p className="mt-2 text-sm text-zinc-400">Operations Dashboard</p>
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium transition hover:border-cyan-400 hover:bg-cyan-500/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm text-zinc-400">System Status</div>
            <div className="mt-2 text-sm font-medium text-lime-300">
              Dashboard active
            </div>
          </div>
        </aside>

        <section className="p-6 lg:p-8">{children}</section>
      </div>
    </main>
  );
}