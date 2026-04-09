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
  customer_address: string | null;
  status: JobStatus | null;
  quoted_price: number | null;
  notes?: string | null;
  assigned_installer_name?: string | null;
  scheduled_start?: string | null;
};

type EditingState = {
  id: string;
  name: string;
  customer: string;
  customer_address: string;
  status: JobStatus;
  quoted_price: string;
  notes: string;
};

export default function JobsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingNew, setSavingNew] = useState(false);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [editing, setEditing] = useState<EditingState | null>(null);

  const [jobName, setJobName] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
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

    return jobs.filter((job) =>
      [job.name, job.customer, job.customer_address, job.status, job.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [jobs, search]);

  function startEdit(job: Job) {
    setEditing({
      id: job.id,
      name: job.name || "",
      customer: job.customer || "",
      customer_address: job.customer_address || "",
      status: (job.status || "New") as JobStatus,
      quoted_price: job.quoted_price != null ? String(job.quoted_price) : "",
      notes: job.notes || "",
    });
  }

  async function saveEdit() {
    if (!editing) return;

    try {
      setSavingEditId(editing.id);
      setMessage("");

      const { data, error } = await supabase
        .from("jobs")
        .update({
          name: editing.name.trim(),
          customer: editing.customer.trim() || null,
          customer_address: editing.customer_address.trim() || null,
          status: editing.status,
          quoted_price: editing.quoted_price ? Number(editing.quoted_price) : null,
          notes: editing.notes.trim() || null,
        })
        .eq("id", editing.id)
        .select("*")
        .single();

      if (error) throw error;

      setJobs((prev) =>
        prev.map((job) => (job.id === editing.id ? (data as Job) : job))
      );
      setEditing(null);
      setMessage("Job updated.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to update job.");
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSavingNew(true);
      setMessage("");

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          name: jobName.trim(),
          customer: customer.trim() || null,
          customer_address: customerAddress.trim() || null,
          status,
          quoted_price: quotedPrice ? Number(quotedPrice) : null,
          notes: notes.trim() || null,
        })
        .select("*")
        .single();

      if (error) throw error;

      setJobs((prev) => [data as Job, ...prev]);
      setJobName("");
      setCustomer("");
      setCustomerAddress("");
      setQuotedPrice("");
      setStatus("New");
      setNotes("");
      setMessage("Job added.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to add job.");
    } finally {
      setSavingNew(false);
    }
  }

  if (loading) {
    return <div className="text-white">Loading jobs...</div>;
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="hero-garage p-5 md:p-7">
          <div className="section-kicker">Jobs</div>
          <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                Job
                <br />
                Management.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                Search projects, edit cards, and create new jobs without leaving the dashboard.
              </p>
            </div>

            <div className="w-full xl:max-w-md">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Quick Search
              </label>
              <input
                type="text"
                className="field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, customers, address..."
              />
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="glass-panel-strong rounded-[28px] p-6 text-zinc-400">
                No jobs found.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isEditing = editing?.id === job.id;

                return (
                  <div key={job.id} className="glass-panel-strong rounded-[28px] p-5 md:p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Job Name">
                            <input
                              className="field"
                              value={editing.name}
                              onChange={(e) =>
                                setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                              }
                            />
                          </Field>

                          <Field label="Customer">
                            <input
                              className="field"
                              value={editing.customer}
                              onChange={(e) =>
                                setEditing((prev) => (prev ? { ...prev, customer: e.target.value } : prev))
                              }
                            />
                          </Field>
                        </div>

                        <Field label="Customer Address">
                          <input
                            className="field"
                            value={editing.customer_address}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev ? { ...prev, customer_address: e.target.value } : prev
                              )
                            }
                          />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Status">
                            <select
                              className="field"
                              value={editing.status}
                              onChange={(e) =>
                                setEditing((prev) =>
                                  prev ? { ...prev, status: e.target.value as JobStatus } : prev
                                )
                              }
                            >
                              <option value="New">New</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Follow Up">Follow Up</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </Field>

                          <Field label="Quoted Price">
                            <input
                              type="number"
                              className="field"
                              value={editing.quoted_price}
                              onChange={(e) =>
                                setEditing((prev) =>
                                  prev ? { ...prev, quoted_price: e.target.value } : prev
                                )
                              }
                            />
                          </Field>
                        </div>

                        <Field label="Notes">
                          <textarea
                            className="field-area"
                            value={editing.notes}
                            onChange={(e) =>
                              setEditing((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                            }
                          />
                        </Field>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={saveEdit}
                            disabled={savingEditId === job.id}
                            className="ui-btn ui-btn-primary"
                          >
                            {savingEditId === job.id ? "Saving..." : "Save Changes"}
                          </button>

                          <button onClick={() => setEditing(null)} className="ui-btn">
                            Cancel
                          </button>

                          <Link href={`/dashboard/jobs/${job.id}`} className="ui-btn">
                            Open Full Job
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="text-2xl font-black tracking-tight text-white md:text-3xl">
                              {job.name || "Untitled Job"}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="ui-chip">{job.status || "No status"}</span>
                              <span className="ui-chip ui-chip-silver">
                                {job.quoted_price != null
                                  ? `$${Number(job.quoted_price).toLocaleString()}`
                                  : "No quote"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button onClick={() => startEdit(job)} className="ui-btn">
                              Edit Card
                            </button>

                            <Link href={`/dashboard/jobs/${job.id}`} className="ui-btn ui-btn-primary">
                              Open Full Job
                            </Link>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <InfoCard title="Customer" value={job.customer || "Not set"} />
                          <InfoCard title="Address" value={job.customer_address || "Not set"} />
                          <InfoCard
                            title="Installer"
                            value={job.assigned_installer_name || "Unassigned"}
                          />
                          <InfoCard
                            title="Schedule"
                            value={job.scheduled_start ? new Date(job.scheduled_start).toLocaleDateString() : "Not scheduled"}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <aside className="glass-panel-strong rounded-[28px] p-5 md:p-6 xl:sticky xl:top-6 xl:self-start">
            <div className="section-kicker">Add Job</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">New Project</h2>
            <p className="mt-3 text-base leading-8 text-zinc-400">
              Create a job with address, quote, status, and notes.
            </p>

            <form onSubmit={handleAddJob} className="mt-6 space-y-4">
              <Field label="Job Name">
                <input className="field" value={jobName} onChange={(e) => setJobName(e.target.value)} required />
              </Field>

              <Field label="Customer">
                <input className="field" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </Field>

              <Field label="Customer Address">
                <input
                  className="field"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Status">
                  <select className="field" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
                    <option value="New">New</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </Field>

                <Field label="Quoted Price">
                  <input
                    type="number"
                    className="field"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea className="field-area" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>

              <button type="submit" disabled={savingNew} className="ui-btn ui-btn-primary w-full">
                {savingNew ? "Adding..." : "Add Job"}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-zinc-300">{label}</div>
      {children}
    </label>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{title}</div>
      <div className="mt-3 text-sm font-semibold leading-7 text-white">{value}</div>
    </div>
  );
}
