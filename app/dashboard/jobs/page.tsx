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
  quotedprice: number | null;
  notes?: string | null;
  assigned_installer_name?: string | null;
  created_at?: string | null;
};

export default function JobsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [jobName, setJobName] = useState("");
  const [customer, setCustomer] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");

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
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setJobs((data as Job[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobs;

    return jobs.filter((job) => {
      const name = job.name?.toLowerCase() || "";
      const cust = job.customer?.toLowerCase() || "";
      const installer = job.assigned_installer_name?.toLowerCase() || "";
      const stat = job.status?.toLowerCase() || "";

      return (
        name.includes(term) ||
        cust.includes(term) ||
        installer.includes(term) ||
        stat.includes(term)
      );
    });
  }, [jobs, search]);

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();

    if (!jobName.trim()) {
      setMessage("Please enter a job name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          name: jobName,
          customer: customer || null,
          quotedprice: quotedPrice ? Number(quotedPrice) : null,
          status,
        })
        .select("*")
        .single();

      if (error) throw error;

      setJobs((prev) => [data as Job, ...prev]);
      setJobName("");
      setCustomer("");
      setQuotedPrice("");
      setStatus("New");
      setMessage("Job added.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to add job.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Jobs
          </p>
          <h1 className="mt-2 text-4xl font-bold">Job Management</h1>
          <p className="mt-2 text-zinc-400">
            Add jobs, search projects, and manage active work.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold">Jobs</h2>

              <input
                type="text"
                placeholder="Search jobs, customers, installer, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 sm:max-w-md"
              />
            </div>

            <div className="space-y-2">
              {filteredJobs.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-zinc-400">
                  No jobs found.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="block rounded-xl border border-white/10 bg-black/25 px-4 py-3 transition hover:border-cyan-400/30 hover:bg-black/40"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-white">
                          {job.name || "Untitled Job"}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {job.customer || "No customer"}
                          {job.assigned_installer_name
                            ? ` • ${job.assigned_installer_name}`
                            : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
                          {job.status || "No status"}
                        </span>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-300">
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

          <aside className="rounded-2xl border border-white/10 bg-neutral-900 p-5 xl:sticky xl:top-6 xl:self-start">
            <h2 className="text-lg font-semibold">Add New Job</h2>

            <form onSubmit={handleAddJob} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Job name"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
                required
              />

              <input
                type="text"
                placeholder="Customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
              />

              <input
                type="number"
                placeholder="Quoted price"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="New">New</option>
                <option value="Quoted">Quoted</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Job"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
