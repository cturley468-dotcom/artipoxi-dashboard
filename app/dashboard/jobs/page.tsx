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
  scheduled_start?: string | null;
  scheduled_end?: string | null;
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
          name: jobName.trim(),
          customer: customer.trim() || null,
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
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading jobs...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="section-kicker">Jobs</div>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Job Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Search projects, manage active work, and create new jobs without
                leaving the dashboard.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                Quick Search
              </label>
              <input
                type="text"
                placeholder="Search jobs, customers, installer, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ui-input"
              />
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="panel-title">Jobs</div>
                <div className="panel-subtitle mt-1 text-sm">
                  {filteredJobs.length} result{filteredJobs.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  No jobs found.
                </div>
              ) : (
                filteredJobs.map((job) => (
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

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
                          <span>{job.customer || "No customer"}</span>
                          {job.assigned_installer_name && (
                            <span>• Installer: {job.assigned_installer_name}</span>
                          )}
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

          <aside className="glass-panel-soft rounded-[28px] p-4 md:p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="section-kicker">Create</div>
            <div className="mt-3 panel-title">Add New Job</div>
            <div className="panel-subtitle mt-2 text-sm">
              Start a new project entry for estimating, scheduling, and work
              order flow.
            </div>

            <form onSubmit={handleAddJob} className="mt-5 space-y-3">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Job Name
                </label>
                <input
                  type="text"
                  placeholder="Example: Smith Garage"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="ui-input"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Customer
                </label>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Quoted Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                  className="ui-select"
                >
                  <option value="New">New</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="ui-btn ui-btn-primary w-full"
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

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}