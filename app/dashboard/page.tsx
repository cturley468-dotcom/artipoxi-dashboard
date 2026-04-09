"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">

      {/* TOP NAV */}
      <div className="top-nav">
        {["Overview","Jobs","Schedule","Leads","Inventory","Configurator","Finance"].map((item,i)=>(
          <div
            key={item}
            className={`top-nav-item ${i===0 ? "top-nav-item-active" : ""}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* HERO */}
      <div className="hero">
        <h1 className="text-5xl font-black leading-tight max-w-3xl">
          Run the business.
          <br />
          Control the workflow.
        </h1>

        <p className="mt-4 text-zinc-300 max-w-xl">
          Manage jobs, scheduling, customer flow, and finances from one control center.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/jobs" className="ui-btn ui-btn-primary">
            Open Jobs
          </Link>
          <Link href="/dashboard/schedule" className="ui-btn ui-btn-secondary">
            Schedule
          </Link>
          <Link href="/configurator" className="ui-btn ui-btn-secondary">
            Configurator
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          "Projected Revenue",
          "Active Jobs",
          "Open Leads",
          "Work Orders"
        ].map(label => (
          <div key={label} className="card">
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-3xl font-bold mt-2">0</div>
          </div>
        ))}
      </div>

      {/* LOWER SECTION */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="card">
          <div className="text-xl font-bold">Quick Actions</div>
          <div className="mt-4 space-y-3">
            <Link href="/dashboard/jobs" className="ui-btn ui-btn-secondary w-full">
              Create Job
            </Link>
            <Link href="/dashboard/schedule" className="ui-btn ui-btn-secondary w-full">
              View Schedule
            </Link>
            <Link href="/dashboard/finance" className="ui-btn ui-btn-secondary w-full">
              Finance
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="text-xl font-bold">System Status</div>
          <div className="mt-4 space-y-2 text-sm text-zinc-400">
            <div>Dashboard: Active</div>
            <div>Jobs: Ready</div>
            <div>Schedule: Ready</div>
            <div>Finance: Ready</div>
          </div>
        </div>

      </div>
    </div>
  );
}
