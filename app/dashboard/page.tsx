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
  quoted_price: number | null;
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
            .select("id, name, customer, status, quoted_price, created_at, scheduled_start")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("leads")
            .select("id, name, service, status, created_at")
            .order("created_at", { ascending: false })
            .limit(4),

          supabase
            .from("work_orders")
            .select("id, title, status, scheduled_date, assigned_installer_name, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
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
    const projectedRevenue = jobs.reduce(
      (sum, job) => sum + Number(job.quoted_price || 0),
      0
    );

    const activeJobs = jobs.filter((job) =>
      ["Quoted", "Scheduled", "In Progress"].includes(job.status || "")
    ).length;

    const openLeads = leads.filter((lead) =>
      !["Won", "Lost", "Closed"].includes(lead.status || "")
    ).length;

    const openWorkOrders = workOrders.filter(
      (order) => order.status !== "Completed"
    ).length;

    return {
      projectedRevenue,
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
        <section className="rounded-[30px] border border-cyan-400/10 bg-[radial-gradient(circle_at_top_left,rgba(73,230,255,0.10),transparent_22%),linear-gradient(135deg,#0d141d_0%,#090d14_50%,#06080d_100%)] p-5 md:p-7">
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
              <HeroStat
                label="Projected Revenue"
                value={`$${metrics.projectedRevenue.toLocaleString()}`}
                tone="cyan"
              />
              <HeroStat
                label="Active Jobs"
                value={String(metrics.activeJobs)}
              />
              <HeroStat
                label="Open Leads"
                value={String(metrics.openLeads)}
              />
              <HeroStat
                label="Open Work Orders"
                value={String(metrics.openWorkOrders)}
                tone="lime"
              />
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="panel-title">Recent Jobs</div>
                <div className="panel-subtitle mt-1 text-sm">
                  Latest project activity
                </div>
              </div>

              <Link href="/dashboard/jobs" className="ui-btn">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {jobs.length === 0 ? (
                <EmptyState text="No jobs yet." />
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
                          {job.quoted_price != null
                            ? `$${Number(job.quoted_price).toLocaleString()}`
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
                    New opportunities
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
                    Installer-facing tasks
                  </div>
                </div>

                <Link href="/dashboard/jobs" className="ui-btn">
                  Jobs
                </Link>
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

        <section className="grid gap-4 md:grid-cols-3">
          <QuickAction
            href="/dashboard/jobs"
            title="Manage Jobs"
            text="Create, quote, assign, and update project status."
          />
          <QuickAction
            href="/dashboard/schedule"
            title="Project Calendar"
            text="Review scheduled jobs in calendar view."
          />
          <QuickAction
            href="/dashboard/finance"
            title="Owner Finance Hub"
            text="Track receipts, payments, and profitability."
          />
        </section>
      </div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "lime";
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div
        className={`mt-3 text-3xl font-black tracking-tight ${
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

function QuickAction({
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
      className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.03]"
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
