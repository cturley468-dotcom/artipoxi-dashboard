"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

type JobStatus =
  | "New"
  | "Quoted"
  | "Follow Up"
  | "Scheduled"
  | "In Progress"
  | "Completed";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  status: JobStatus | null;
  quotedprice?: number | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");

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

        const { data, error } = await supabase
          .from("jobs")
          .select("id, name, customer, status, quotedprice")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setJobs((data as Job[]) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const totalRevenue = jobs.reduce(
    (sum, job) => sum + Number(job.quotedprice || 0),
    0
  );

  const activeJobs = jobs.filter(
    (job) => job.status === "Scheduled" || job.status === "In Progress"
  ).length;

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobs.slice(0, 5);

    return jobs.filter((job) => {
      const name = job.name?.toLowerCase() || "";
      const customer = job.customer?.toLowerCase() || "";
      const status = job.status?.toLowerCase() || "";

      return (
        name.includes(term) ||
        customer.includes(term) ||
        status.includes(term)
      );
    });
  }, [jobs, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
            ArtiPoxi Operations
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Run Your Projects.
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-300">
            Track jobs, monitor scheduling, review project progress, and find
            jobs fast with one clean dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
          <StatCard label="Total Jobs" value={`${jobs.length}`} />
          <StatCard label="Active Jobs" value={`${activeJobs}`} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quick Job Search</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Find jobs by name, customer, or status.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 lg:max-w-md"
            />
          </div>

          <div className="mt-5 space-y-2">
            {filteredJobs.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                No matching jobs found.
              </div>
            ) : (
              filteredJobs.slice(0, 8).map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/jobs/${job.id}`}
                  className="block rounded-xl border border-white/10 bg-black/25 px-4 py-3 transition hover:border-cyan-400/30 hover:bg-black/40"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-white">
                        {job.name || "Untitled Job"}
                      </div>
                      <div className="mt-1 text-sm text-zinc-400">
                        {job.customer || "No customer"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
                        {job.status || "No status"}
                      </span>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
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
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-cyan-300">{value}</div>
    </div>
  );
}
