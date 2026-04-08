"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  status: string | null;
  quotedprice: number | null;
  created_at: string | null;
  scheduled_start?: string | null;
};

type Lead = {
  id: string;
  name: string | null;
  service: string | null;
  status: string | null;
  created_at: string | null;
};

type WorkOrder = {
  id: string;
  title: string | null;
  status: string | null;
  scheduled_date: string | null;
  assigned_installer_name?: string | null;
  created_at: string | null;
};

export default function DashboardOverviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.role !== "admin" && profile.role !== "staff") {
          router.replace("/auth/callback");
          return;
        }

        const [jobsRes, leadsRes, workOrdersRes] = await Promise.all([
          supabase
            .from("jobs")
            .select("id, name, customer, status, quotedprice, created_at, scheduled_start")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("leads")
            .select("id, name, service, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("work_orders")
            .select("id, title, status, scheduled_date, assigned_installer_name, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (jobsRes.error) throw jobsRes.error;
        if (leadsRes.error) throw leadsRes.error;
        if (workOrdersRes.error) throw workOrdersRes.error;

        setJobs((jobsRes.data as Job[]) || []);
        setLeads((leadsRes.data as Lead[]) || []);
        setWorkOrders((workOrdersRes.data as WorkOrder[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const metrics = useMemo(() => {
    const totalRevenue = jobs.reduce(
      (sum, job) => sum + Number(job.quotedprice || 0),
      0
    );

    const activeJobs = jobs.filter((job) =>
      ["Scheduled", "In Progress", "Quoted"].includes(job.status || "")
    ).length;

    const openLeads = leads.filter((lead) =>
      !["Closed", "Won", "Lost"].includes(lead.status || "")
    ).length;

    const openWorkOrders = workOrders.filter(
      (order) => order.status !== "Completed"
    ).length;

    return {
      totalRevenue,
      totalJobs: jobs.length,
      activeJobs,
      openLeads,
      openWorkOrders,
    };
  }, [jobs, leads, workOrders]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="section-kicker">Operations Dashboard</div>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Run Your Projects
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Track jobs, leads, work orders, and business activity from one
                clean control center.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/jobs" className="ui-btn ui-btn-primary">
                Open Jobs
              </Link>
              <Link href="/configurator" className="ui-btn">
                Open Configurator
              </Link>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Projected Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            tone="cyan"
          />
          <MetricCard
            label="Total Jobs"
            value={String(metrics.totalJobs)}
          />
          <MetricCard
            label="Active Jobs"
            value={String(metrics.activeJobs)}
          />
          <MetricCard
            label="Open Leads"
            value={String(metrics.openLeads)}
          />
          <MetricCard
            label="Open Work Orders"
            value={String(metrics.openWorkOrders)}
            tone="lime"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="panel-title">Recent Jobs</div>
                <div className="panel-subtitle mt-1 text-sm">
                  Your latest project activity
                </div>
              </div>

              <Link href="/dashboard/jobs" className="ui-btn">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <EmptyState text="No jobs yet. Add your first project from the Jobs page." />
              ) : (
                jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="block rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-white">
                          {job.name || "Untitled Job"}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-400">
                          <span>{job.customer || "No customer"}</span>
                          {job.scheduled_start && (
                            <span>• {formatDate(job.scheduled_start)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="ui-chip">
                          {job.status || "No status"}
                        </span>
                        <span className="ui-chip ui-chip-cyan">
                          {job.quotedprice != null
                            ? `$${Number(job.quotedprice).toLocaleString()}`
                            : "No quote"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="panel-title">Lead Pipeline</div>
                  <div className="panel-subtitle mt-1 text-sm">
                    Recent incoming opportunities
                  </div>
                </div>

                <Link href="/dashboard/leads" className="ui-btn">
                  Leads
                </Link>
              </div>

              <div className="space-y-3">
                {leads.length === 0 ? (
                  <EmptyState text="No leads yet." />
                ) : (
                  leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-bold text-white">
                            {lead.name || "Unnamed Lead"}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {lead.service || "No service listed"}
                          </div>
                        </div>

                        <span className="ui-chip">
                          {lead.status || "New"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="panel-title">Work Orders</div>
                  <div className="panel-subtitle mt-1 text-sm">
                    Installer-facing execution
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {workOrders.length === 0 ? (
                  <EmptyState text="No work orders yet." />
                ) : (
                  workOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-bold text-white">
                            {order.title || "Untitled Work Order"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-400">
                            {order.assigned_installer_name && (
                              <span>{order.assigned_installer_name}</span>
                            )}
                            {order.scheduled_date && (
                              <span>• {formatDate(order.scheduled_date)}</span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`ui-chip ${
                            order.status === "Completed"
                              ? "ui-chip-lime"
                              : "ui-chip-cyan"
                          }`}
                        >
                          {order.status || "Open"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <QuickLink
              href="/dashboard/jobs"
              title="Manage Jobs"
              text="Create, quote, schedule, and update project status."
            />
            <QuickLink
              href="/dashboard/schedule"
              title="View Schedule"
              text="See project timing and installation flow."
            />
            <QuickLink
              href="/dashboard/inventory"
              title="Track Inventory"
              text="Monitor materials, supplies, and system usage."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "lime";
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div
        className={`metric-value ${
          tone === "cyan"
            ? "text-cyan-300"
            : tone === "lime"
            ? "text-lime-300"
            : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[22px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
    >
      <div className="text-lg font-bold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-zinc-400">{text}</div>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
