"use client";

import { useEffect, useState } from "react";
import { getCurrentProfile } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "installer" | "customer";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
};

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
};

type WorkOrder = {
  id: string;
  job_id: string | null;
  title: string | null;
  description: string | null;
  materials: string | null;
  scheduled_date: string | null;
  status: "Open" | "In Progress" | "Completed";
  assigned_installer_id: string | null;
  assigned_installer_name: string | null;
  created_at: string;
};

export default function WorkOrdersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [installers, setInstallers] = useState<Profile[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [jobId, setJobId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState<"Open" | "In Progress" | "Completed">("Open");
  const [assignedInstallerId, setAssignedInstallerId] = useState("");

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

        const [
          { data: jobsData, error: jobsError },
          { data: installersData, error: installersError },
          { data: workOrdersData, error: workOrdersError },
        ] = await Promise.all([
          supabase
            .from("jobs")
            .select("id, name, customer")
            .order("name", { ascending: true }),
          supabase
            .from("profiles")
            .select("id, email, full_name, role")
            .eq("role", "installer")
            .order("full_name", { ascending: true }),
          supabase
            .from("work_orders")
            .select(
              "id, job_id, title, description, materials, scheduled_date, status, assigned_installer_id, assigned_installer_name, created_at"
            )
            .order("created_at", { ascending: false }),
        ]);

        if (jobsError) throw jobsError;
        if (installersError) throw installersError;
        if (workOrdersError) throw workOrdersError;

        setJobs((jobsData as Job[]) || []);
        setInstallers((installersData as Profile[]) || []);
        setWorkOrders((workOrdersData as WorkOrder[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load work orders.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function handleCreate() {
    if (!jobId || !title.trim()) {
      setMessage("Please select a job and enter a work order title.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const selectedInstaller =
        installers.find((installer) => installer.id === assignedInstallerId) || null;

      const { data, error } = await supabase
        .from("work_orders")
        .insert({
          job_id: jobId,
          title,
          description: description || null,
          materials: materials || null,
          scheduled_date: scheduledDate || null,
          status,
          assigned_installer_id: assignedInstallerId || null,
          assigned_installer_name: selectedInstaller?.full_name || null,
        })
        .select(
          "id, job_id, title, description, materials, scheduled_date, status, assigned_installer_id, assigned_installer_name, created_at"
        )
        .single();

      if (error) throw error;

      setWorkOrders((prev) => [data as WorkOrder, ...prev]);

      setJobId("");
      setTitle("");
      setDescription("");
      setMaterials("");
      setScheduledDate("");
      setStatus("Open");
      setAssignedInstallerId("");
      setMessage("Work order created.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to create work order.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading work orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-bold">Work Orders</h1>
          <p className="mt-2 text-zinc-400">
            Create and assign work orders for installers.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Create Work Order</h2>

            <div className="mt-5 space-y-4">
              <Field label="Job">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name || "Untitled Job"}{job.customer ? ` — ${job.customer}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Work Order Title">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Garage floor prep and coating"
                />
              </Field>

              <Field label="Description">
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Job instructions, prep notes, site details..."
                />
              </Field>

              <Field label="Materials">
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Primer, flakes, topcoat, rollers..."
                />
              </Field>

              <Field label="Scheduled Date">
                <input
                  type="date"
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </Field>

              <Field label="Status">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "Open" | "In Progress" | "Completed")
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </Field>

              <Field label="Assign Installer">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={assignedInstallerId}
                  onChange={(e) => setAssignedInstallerId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {installers.map((installer) => (
                    <option key={installer.id} value={installer.id}>
                      {installer.full_name || installer.email || installer.id}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Work Order"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Recent Work Orders</h2>

            <div className="mt-5 space-y-4">
              {workOrders.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-400">
                  No work orders yet.
                </div>
              ) : (
                workOrders.map((order) => {
                  const linkedJob = jobs.find((job) => job.id === order.job_id);

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-lg font-bold text-white">
                            {order.title || "Untitled Work Order"}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Job: {linkedJob?.name || "Unknown job"}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Customer: {linkedJob?.customer || "-"}
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-3">
                          <Badge label={order.status} />
                          <MiniInfo
                            title="Installer"
                            value={order.assigned_installer_name || "Unassigned"}
                          />
                          <MiniInfo
                            title="Date"
                            value={order.scheduled_date || "-"}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-zinc-400">Description</div>
                        <div className="mt-1 text-zinc-200">
                          {order.description || "No description."}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-zinc-400">Materials</div>
                        <div className="mt-1 whitespace-pre-wrap text-zinc-200">
                          {order.materials || "No materials listed."}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-zinc-400">{label}</div>
      {children}
    </label>
  );
}

function MiniInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  const classes =
    label === "Completed"
      ? "border-lime-400/20 bg-lime-400/10 text-lime-300"
      : label === "In Progress"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
      : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold ${classes}`}
    >
      {label}
    </div>
  );
}