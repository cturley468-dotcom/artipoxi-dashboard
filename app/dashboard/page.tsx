"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

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
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    async function checkAccess() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.role !== "admin" && profile.role !== "staff") {
          router.replace("/portal");
          return;
        }

        setAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    }

    checkAccess();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

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
            materialsCost: 1100,
            laborCost: 1400,
            miscCost: 200,
            beforePhotos: [],
            afterPhotos: [],
          },
          {
            id: "miller-patio-coating",
            name: "Miller Patio Coating",
            customer: "Sarah Miller",
            status: "Scheduled",
            quotedPrice: 2800,
            materialsCost: 700,
            laborCost: 900,
            miscCost: 150,
            beforePhotos: [],
            afterPhotos: [],
          },
          {
            id: "johnson-basement-seal",
            name: "Johnson Basement Seal",
            customer: "Mike Johnson",
            status: "Quoted",
            quotedPrice: 3600,
            materialsCost: 900,
            laborCost: 1200,
            miscCost: 180,
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
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked || !ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs, ready, authChecked]);

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

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      activeJobs,
      quotedJobs,
      totalJobs: jobs.length,
    };
  }, [jobs]);

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Checking access...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                ArtiPoxi Operations
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight">
                Run Your Projects.
              </h1>
              <p className="mt-3 max-w-2xl text-zinc-400">
                Track jobs, monitor scheduling, review financials, and move fast
                with one clean dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/jobs"
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Open Jobs
              </Link>
              <Link
                href="/dashboard/schedule"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-400/40"
              >
                View Schedule
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              title="Estimated Profit"
              value={`$${stats.totalProfit.toLocaleString()}`}
              tone="lime"
            />
            <StatCard title="Active Jobs" value={`${stats.activeJobs}`} />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Jobs</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Latest projects in your system
                  </p>
                </div>

                <Link
                  href="/dashboard/jobs"
                  className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {recentJobs.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-zinc-400">
                    No jobs yet.
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-lg font-bold text-white">
                            {job.name}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {job.customer}
                          </div>
                          <StatusBadge status={job.status} />
                        </div>

                        <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-3 lg:min-w-[320px]">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-zinc-500">Quoted</div>
                            <div className="mt-1 font-semibold text-white">
                              ${job.quotedPrice.toLocaleString()}
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-zinc-500">Cost</div>
                            <div className="mt-1 font-semibold text-white">
                              $
                              {(
                                job.materialsCost +
                                job.laborCost +
                                job.miscCost
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-zinc-500">Profit</div>
                            <div className="mt-1 font-semibold text-lime-300">
                              $
                              {(
                                job.quotedPrice -
                                (job.materialsCost +
                                  job.laborCost +
                                  job.miscCost)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h2 className="text-xl font-bold">Pipeline</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Snapshot of current activity
                </p>

                <div className="mt-5 grid gap-3">
                  <MiniStat
                    label="Total Jobs"
                    value={`${stats.totalJobs}`}
                    classes="text-white"
                  />
                  <MiniStat
                    label="Quoted Jobs"
                    value={`${stats.quotedJobs}`}
                    classes="text-yellow-300"
                  />
                  <MiniStat
                    label="Active Jobs"
                    value={`${stats.activeJobs}`}
                    classes="text-cyan-300"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <h2 className="text-xl font-bold">Quick Links</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Jump straight into the tools you use most
                </p>

                <div className="mt-5 grid gap-4">
                  <QuickLink
                    href="/dashboard/jobs"
                    title="Manage Jobs"
                    text="Open job list, create projects, and update project details."
                  />
                  <QuickLink
                    href="/dashboard/schedule"
                    title="Schedule Calendar"
                    text="Review scheduled work and manage project timing."
                  />
                  <QuickLink
                    href="/dashboard/leads"
                    title="View Leads"
                    text="Track incoming leads and move them toward active projects."
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
          </section>
        </div>
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
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  classes,
}: {
  label: string;
  value: string;
  classes: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-zinc-400">{label}</div>
      <div className={`font-semibold ${classes}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const classes =
    status === "Completed"
      ? "mt-3 inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-300"
      : status === "In Progress"
      ? "mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300"
      : status === "Quoted"
      ? "mt-3 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-300"
      : "mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200";

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
      className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/30"
    >
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-zinc-400">{text}</div>
    </Link>
  );
}
