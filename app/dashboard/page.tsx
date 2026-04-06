"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "artipoxi_jobs";

type JobStatus =
  | "New"
  | "Quoted"
  | "Follow Up"
  | "Scheduled"
  | "In Progress"
  | "Completed";

type Job = {
  id: string;
  name: string;
  customer: string;
  status: JobStatus;
  quotedPrice: number;
  materialsCost: number;
  laborCost: number;
  miscCost: number;
  beforePhotos?: string[];
  afterPhotos?: string[];
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        const starterJobs: Job[] = [
          {
            id: "smith-garage-floor",
            name: "Smith Garage Floor",
            customer: "John Smith",
            status: "In Progress",
            quotedPrice: 4200,
            materialsCost: 980,
            laborCost: 1500,
            miscCost: 120,
            beforePhotos: [],
            afterPhotos: [],
          },
          {
            id: "johnson-patio",
            name: "Johnson Patio",
            customer: "Amy Johnson",
            status: "Quoted",
            quotedPrice: 2800,
            materialsCost: 620,
            laborCost: 900,
            miscCost: 85,
            beforePhotos: [],
            afterPhotos: [],
          },
        ];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(starterJobs));
        setJobs(starterJobs);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as Job[];
      setJobs(Array.isArray(parsed) ? parsed : []);
    } catch {
      setJobs([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs, ready]);

  const stats = useMemo(() => {
    const totalRevenue = jobs.reduce((sum, job) => sum + job.quotedPrice, 0);
    const totalCost = jobs.reduce(
      (sum, job) => sum + job.materialsCost + job.laborCost + job.miscCost,
      0
    );
    const totalProfit = totalRevenue - totalCost;

    const activeJobs = jobs.filter(
      (job) => job.status === "In Progress" || job.status === "Scheduled"
    ).length;

    const quotedJobs = jobs.filter((job) => job.status === "Quoted").length;

    const completedJobs = jobs.filter(
      (job) => job.status === "Completed"
    ).length;

    const averageMargin =
      totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      activeJobs,
      quotedJobs,
      completedJobs,
      averageMargin,
    };
  }, [jobs]);

  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Business Overview</h1>
        <p className="mt-2 text-zinc-400">
          Monitor revenue, track jobs, and manage your pipeline in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          tone="cyan"
        />
        <StatCard
          title="Total Cost"
          value={`$${stats.totalCost.toLocaleString()}`}
        />
        <StatCard
          title="Total Profit"
          value={`$${stats.totalProfit.toLocaleString()}`}
          tone="lime"
        />
        <StatCard
          title="Average Margin"
          value={`${stats.averageMargin}%`}
          tone="cyan"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat title="Active Jobs" value={stats.activeJobs} />
        <MiniStat title="Quoted Jobs" value={stats.quotedJobs} />
        <MiniStat title="Completed Jobs" value={stats.completedJobs} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Jobs</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Quick access to your newest projects.
              </p>
            </div>

            <Link
              href="/dashboard/jobs"
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-400/20"
            >
              View All Jobs
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-zinc-400">
                No jobs yet. Create your first job in the Jobs page.
              </div>
            ) : (
              recentJobs.map((job) => {
                const totalCost =
                  job.materialsCost + job.laborCost + job.miscCost;
                const profit = job.quotedPrice - totalCost;
                const margin =
                  job.quotedPrice > 0
                    ? ((profit / job.quotedPrice) * 100).toFixed(1)
                    : "0.0";

                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="block rounded-2xl border border-white/10 bg-black/20 p-5 hover:border-cyan-400/40 hover:bg-black/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {job.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {job.customer}
                        </p>
                        <StatusBadge status={job.status} />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Metric
                          label="Revenue"
                          value={`$${job.quotedPrice.toLocaleString()}`}
                        />
                        <Metric
                          label="Profit"
                          value={`$${profit.toLocaleString()}`}
                          tone="lime"
                        />
                        <Metric
                          label="Margin"
                          value={`${margin}%`}
                          tone="cyan"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Jump straight into your workflow.
          </p>

          <div className="mt-6 grid gap-3">
            <QuickLink
              href="/dashboard/jobs"
              title="Manage Jobs"
              text="Create jobs, update finances, and open job cards."
            />
            <QuickLink
              href="/dashboard/leads"
              title="Review Leads"
              text="Check quotes and follow-up opportunities."
            />
            <QuickLink
              href="/dashboard/inventory"
              title="Track Inventory"
              text="Monitor stock, cost, and low inventory alerts."
            />
            <QuickLink
              href="/configurator"
              title="Open Configurator"
              text="Build a quote and feed new leads into the system."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string;
  tone?: "default" | "cyan" | "lime";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "lime"
      ? "text-lime-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "lime";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "lime"
      ? "text-lime-300"
      : "text-white";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={`mt-2 text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const classes =
    status === "Completed"
      ? "mt-3 inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs text-lime-300"
      : status === "In Progress"
      ? "mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
      : status === "Quoted"
      ? "mt-3 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300"
      : "mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300";

  return <div className={classes}>{status}</div>;
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
      className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-cyan-400/30 hover:bg-black/30"
    >
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-zinc-400">{text}</div>
    </Link>
  );
}