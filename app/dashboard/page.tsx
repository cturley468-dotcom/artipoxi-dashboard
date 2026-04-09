"use client";

import Link from "next/link";

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="app-card-soft app-section">
        <div className="app-kicker">ArtiPoxi</div>
        <h1 className="app-title mt-4">
          Dashboard
        </h1>
        <p className="app-subtitle mt-4 max-w-2xl">
          Track jobs, scheduling, customer flow, and business activity from one
          clean control center.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard/jobs" className="ui-btn ui-btn-primary">
            Open Jobs
          </Link>
          <Link href="/dashboard/schedule" className="ui-btn ui-btn-secondary">
            View Schedule
          </Link>
          <Link href="/configurator" className="ui-btn ui-btn-secondary">
            Configurator
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="ui-stat">
          <div className="ui-stat-label">Projected Revenue</div>
          <div className="ui-stat-value">$0</div>
        </div>

        <div className="ui-stat">
          <div className="ui-stat-label">Active Jobs</div>
          <div className="ui-stat-value">0</div>
        </div>

        <div className="ui-stat">
          <div className="ui-stat-label">Open Leads</div>
          <div className="ui-stat-value">0</div>
        </div>

        <div className="ui-stat">
          <div className="ui-stat-label">Work Orders</div>
          <div className="ui-stat-value">0</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="app-card-soft app-section">
          <div className="text-2xl font-black">Quick Actions</div>
          <div className="mt-5 grid gap-3">
            <Link href="/dashboard/jobs" className="ui-btn ui-btn-secondary w-full">
              Create Job
            </Link>
            <Link href="/dashboard/schedule" className="ui-btn ui-btn-secondary w-full">
              Open Schedule
            </Link>
            <Link href="/dashboard/finance" className="ui-btn ui-btn-secondary w-full">
              Finance Hub
            </Link>
          </div>
        </div>

        <div className="app-card-soft app-section">
          <div className="text-2xl font-black">System Status</div>
          <div className="mt-5 grid gap-3">
            <div className="ui-list-card flex items-center justify-between">
              <span className="text-zinc-300">Dashboard</span>
              <span className="text-cyan-400 font-bold">Active</span>
            </div>
            <div className="ui-list-card flex items-center justify-between">
              <span className="text-zinc-300">Jobs</span>
              <span className="text-cyan-400 font-bold">Ready</span>
            </div>
            <div className="ui-list-card flex items-center justify-between">
              <span className="text-zinc-300">Schedule</span>
              <span className="text-cyan-400 font-bold">Ready</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
