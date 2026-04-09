"use client";

import Link from "next/link";

export default function DashboardOverviewPage() {
  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="hero-garage p-5 md:p-7">
          <div className="section-kicker">Operations Dashboard</div>

          <div className="mt-4 grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                Run Your
                <br />
                Projects.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                Track jobs, scheduling, work orders, leads, and finances from one
                clean control center built for fast daily use.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/dashboard/jobs" className="ui-btn ui-btn-primary">
                  Open Jobs
                </Link>
                <Link href="/dashboard/schedule" className="ui-btn">
                  View Schedule
                </Link>
                <Link href="/dashboard/finance" className="ui-btn">
                  Finance Hub
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard label="Projected Revenue" value="$0" />
              <StatCard label="Active Jobs" value="0" />
              <StatCard label="Open Leads" value="0" />
              <StatCard label="Open Work Orders" value="0" />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="panel-title">Recent Jobs</div>
                <div className="panel-subtitle mt-1 text-sm">Latest project activity</div>
              </div>
              <Link href="/dashboard/jobs" className="ui-btn">View All</Link>
            </div>
            <EmptyState text="No jobs yet." />
          </section>

          <div className="flex flex-col gap-6">
            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="panel-title">Lead Pipeline</div>
                  <div className="panel-subtitle mt-1 text-sm">New opportunities</div>
                </div>
                <Link href="/dashboard/leads" className="ui-btn">Leads</Link>
              </div>
              <EmptyState text="No leads yet." />
            </section>

            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="panel-title">Work Orders</div>
                  <div className="panel-subtitle mt-1 text-sm">Installer-facing tasks</div>
                </div>
                <Link href="/dashboard/jobs" className="ui-btn">Jobs</Link>
              </div>
              <EmptyState text="No work orders yet." />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/35 p-4 backdrop-blur md:p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-100">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/25 px-4 py-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}
