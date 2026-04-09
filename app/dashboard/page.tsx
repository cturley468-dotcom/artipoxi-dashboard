"use client";

import Link from "next/link";

const stats = [
  { label: "Projected Revenue", value: "$0", subtext: "Current open pipeline" },
  { label: "Active Jobs", value: "0", subtext: "Projects in motion" },
  { label: "Open Leads", value: "0", subtext: "Waiting on follow-up" },
  { label: "Work Orders", value: "0", subtext: "Installer-facing tasks" },
];

const quickActions = [
  {
    title: "Create New Job",
    text: "Add a new project, customer, quote, and address.",
    href: "/dashboard/jobs",
    button: "Open Jobs",
  },
  {
    title: "View Schedule",
    text: "Check weekly production flow and project timing.",
    href: "/dashboard/schedule",
    button: "Open Schedule",
  },
  {
    title: "Open Finance Hub",
    text: "Track invoices, payments, and owner-level numbers.",
    href: "/dashboard/finance",
    button: "Open Finance",
  },
];

export default function DashboardOverviewPage() {
  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="hero-garage p-5 md:p-7 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div>
              <div className="section-kicker">Operations Dashboard</div>

              <h1 className="mt-4 text-4xl font-black leading-[0.92] tracking-tight md:text-6xl">
                Run the business.
                <br />
                Control the workflow.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                Manage jobs, scheduling, customer flow, work orders, and financial
                visibility from one premium control center built for real daily use.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/dashboard/jobs" className="ui-btn ui-btn-primary">
                  Open Jobs
                </Link>
                <Link href="/dashboard/schedule" className="ui-btn">
                  View Schedule
                </Link>
                <Link href="/configurator" className="ui-btn">
                  Configurator
                </Link>
              </div>
            </div>

            <div className="glass-panel-strong rounded-[28px] p-5 md:p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Owner View
              </div>

              <div className="mt-4 text-3xl font-black tracking-tight text-white">
                Daily Snapshot
              </div>

              <div className="mt-4 space-y-3">
                <MiniMetric label="Jobs ready to start" value="0" />
                <MiniMetric label="Quotes pending" value="0" />
                <MiniMetric label="Follow-ups due" value="0" />
              </div>

              <div className="mt-5">
                <Link href="/dashboard/finance" className="ui-btn ui-btn-primary w-full">
                  Go to Finance Hub
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-panel-soft rounded-[24px] p-5"
            >
              <div className="text-sm text-zinc-400">{stat.label}</div>
              <div className="mt-3 text-4xl font-black tracking-tight text-white">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-zinc-500">{stat.subtext}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel-strong rounded-[28px] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="panel-title">Quick Actions</div>
                <div className="panel-subtitle mt-2 text-sm">
                  Jump into the most important parts of the business.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-[22px] border border-white/10 bg-black/25 p-4"
                >
                  <div className="text-lg font-bold text-white">
                    {action.title}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-zinc-400">
                    {action.text}
                  </div>
                  <div className="mt-4">
                    <Link href={action.href} className="ui-btn w-full">
                      {action.button}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel-soft rounded-[28px] p-5 md:p-6">
            <div className="panel-title">System Status</div>
            <div className="panel-subtitle mt-2 text-sm">
              High-level workflow health.
            </div>

            <div className="mt-6 space-y-4">
              <StatusRow label="Dashboard" value="Active" />
              <StatusRow label="Job Tracking" value="Ready" />
              <StatusRow label="Scheduling" value="Ready" />
              <StatusRow label="Finance Hub" value="Ready" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="glass-panel-soft rounded-[28px] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="panel-title">Recent Jobs</div>
                <div className="panel-subtitle mt-2 text-sm">
                  Latest project activity will appear here.
                </div>
              </div>

              <Link href="/dashboard/jobs" className="ui-btn">
                View All
              </Link>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">
              No jobs yet.
            </div>
          </div>

          <div className="glass-panel-soft rounded-[28px] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="panel-title">Lead Pipeline</div>
                <div className="panel-subtitle mt-2 text-sm">
                  New opportunities and follow-up flow.
                </div>
              </div>

              <Link href="/dashboard/leads" className="ui-btn">
                Open Leads
              </Link>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">
              No leads yet.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-lg font-black text-white">{value}</div>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/25 px-4 py-3">
      <div className="text-sm text-zinc-300">{label}</div>
      <span className="ui-chip ui-chip-silver">{value}</span>
    </div>
  );
}
