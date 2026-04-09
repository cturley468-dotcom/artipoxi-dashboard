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
    <main className="page-shell">
      <div className="app-container">
        <div className="app-card app-section">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <BrandMark
                href="/dashboard"
                subtitle="Operations"
                size="md"
              />

              <div className="ui-pill-nav">
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`ui-pill ${active ? "ui-pill-active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
