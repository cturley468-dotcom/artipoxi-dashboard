"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCurrentProfile } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";

type UserRole = "admin" | "staff" | "installer" | "customer";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
};

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
  scheduled_start: string | null;
  scheduled_end: string | null;
  notes: string | null;
  assigned_installer_id: string | null;
  assigned_installer_name: string | null;
};

type WorkOrderStatus = "Open" | "In Progress" | "Completed";

type WorkOrder = {
  id: string;
  job_id: string | null;
  title: string | null;
  description: string | null;
  materials: string | null;
  scheduled_date: string | null;
  status: WorkOrderStatus;
  assigned_installer_id: string | null;
  assigned_installer_name: string | null;
  created_at: string;
};

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawJobId =
  (params?.jobId as string | string[] | undefined) ??
  (params?.jobid as string | string[] | undefined) ??
  (params?.id as string | string[] | undefined);

const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

  const [loading, setLoading] = useState(true);
  const [savingJob, setSavingJob] = useState(false);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [installers, setInstallers] = useState<Profile[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedInstallerId, setAssignedInstallerId] = useState("");

  const [woTitle, setWoTitle] = useState("");
  const [woDescription, setWoDescription] = useState("");
  const [woMaterials, setWoMaterials] = useState("");
  const [woScheduledDate, setWoScheduledDate] = useState("");
  const [woStatus, setWoStatus] = useState<WorkOrderStatus>("Open");
  const [woAssignedInstallerId, setWoAssignedInstallerId] = useState("");

  const selectedInstaller = useMemo(
    () => installers.find((installer) => installer.id === assignedInstallerId) || null,
    [installers, assignedInstallerId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      if (!jobId) {
        if (!cancelled) {
          setErrorMessage("Missing job ID.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const currentProfile = await getCurrentProfile();

        if (!currentProfile) {
          router.replace("/login");
          return;
        }

        if (currentProfile.role !== "admin" && currentProfile.role !== "staff") {
          router.replace("/auth/callback");
          return;
        }

        const [jobResult, installersResult, workOrdersResult] = await Promise.all([
          supabase
            .from("jobs")
            .select(
              "id, name, customer, status, scheduled_start, scheduled_end, notes, assigned_installer_id, assigned_installer_name"
            )
            .eq("id", jobId)
            .maybeSingle(),
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
            .eq("job_id", jobId)
            .order("created_at", { ascending: false }),
        ]);

        if (jobResult.error) throw jobResult.error;
        if (installersResult.error) throw installersResult.error;
        if (workOrdersResult.error) throw workOrdersResult.error;

        if (!jobResult.data) {
          if (!cancelled) {
            setErrorMessage("Job not found.");
            setJob(null);
            setInstallers((installersResult.data as Profile[]) || []);
            setWorkOrders((workOrdersResult.data as WorkOrder[]) || []);
            setLoading(false);
          }
          return;
        }

        const loadedJob = jobResult.data as Job;
        const loadedInstallers = (installersResult.data as Profile[]) || [];
        const loadedWorkOrders = (workOrdersResult.data as WorkOrder[]) || [];

        if (!cancelled) {
          setJob(loadedJob);
          setInstallers(loadedInstallers);
          setWorkOrders(loadedWorkOrders);

          setName(loadedJob.name || "");
          setCustomer(loadedJob.customer || "");
          setStatus(loadedJob.status || "New");
          setScheduledStart(loadedJob.scheduled_start || "");
          setScheduledEnd(loadedJob.scheduled_end || "");
          setNotes(loadedJob.notes || "");
          setAssignedInstallerId(loadedJob.assigned_installer_id || "");
          setWoAssignedInstallerId(loadedJob.assigned_installer_id || "");
          setLoading(false);
        }
      } catch (error: any) {
        if (!cancelled) {
          setErrorMessage(error?.message || "Failed to load job details.");
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [jobId, router]);

  async function handleSaveJob() {
    if (!job) return;

    try {
      setSavingJob(true);
      setErrorMessage("");
      setSuccessMessage("");

      const installer =
        installers.find((item) => item.id === assignedInstallerId) || null;

      const { data, error } = await supabase
        .from("jobs")
        .update({
          name: name || null,
          customer: customer || null,
          status,
          scheduled_start: scheduledStart || null,
          scheduled_end: scheduledEnd || null,
          notes: notes || null,
          assigned_installer_id: assignedInstallerId || null,
          assigned_installer_name: installer?.full_name || null,
        })
        .eq("id", job.id)
        .select(
          "id, name, customer, status, scheduled_start, scheduled_end, notes, assigned_installer_id, assigned_installer_name"
        )
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Updated job was not returned.");

      setJob(data as Job);
      setSuccessMessage("Job updated successfully.");
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to save job.");
    } finally {
      setSavingJob(false);
    }
  }

  async function handleCreateWorkOrder() {
    if (!job) return;

    if (!woTitle.trim()) {
      setErrorMessage("Please enter a work order title.");
      setSuccessMessage("");
      return;
    }

    try {
      setCreatingWorkOrder(true);
      setErrorMessage("");
      setSuccessMessage("");

      const installer =
        installers.find((item) => item.id === woAssignedInstallerId) || null;

      const { data, error } = await supabase
        .from("work_orders")
        .insert({
          job_id: job.id,
          title: woTitle,
          description: woDescription || null,
          materials: woMaterials || null,
          scheduled_date: woScheduledDate || null,
          status: woStatus,
          assigned_installer_id: woAssignedInstallerId || null,
          assigned_installer_name: installer?.full_name || null,
        })
        .select(
          "id, job_id, title, description, materials, scheduled_date, status, assigned_installer_id, assigned_installer_name, created_at"
        )
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Work order was not returned.");

      setWorkOrders((prev) => [data as WorkOrder, ...prev]);
      setWoTitle("");
      setWoDescription("");
      setWoMaterials("");
      setWoScheduledDate("");
      setWoStatus("Open");
      setWoAssignedInstallerId(assignedInstallerId || "");
      setSuccessMessage("Work order created.");
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to create work order.");
    } finally {
      setCreatingWorkOrder(false);
    }
  }

  async function handleUpdateWorkOrderStatus(
    workOrderId: string,
    nextStatus: WorkOrderStatus
  ) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const { error } = await supabase
        .from("work_orders")
        .update({ status: nextStatus })
        .eq("id", workOrderId);

      if (error) throw error;

      setWorkOrders((prev) =>
        prev.map((order) =>
          order.id === workOrderId ? { ...order, status: nextStatus } : order
        )
      );

      setSuccessMessage("Work order status updated.");
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to update work order.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading job...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl space-y-4">
          <Link
            href="/dashboard/jobs"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Jobs
          </Link>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            {errorMessage || "Job not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Job Details
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {job.name || "Untitled Job"}
            </h1>
            <p className="mt-2 text-zinc-400">
              Manage project details, installer assignment, and work orders.
            </p>
          </div>

          <Link
            href="/dashboard/jobs"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30"
          >
            Back to Jobs
          </Link>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-4 text-sm text-lime-200">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Project Info</h2>

            <div className="mt-5 space-y-4">
              <Field label="Job Name">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field label="Customer">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </Field>

              <Field label="Status">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                >
                  <option value="New">New</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Scheduled Start">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                    value={scheduledStart ? scheduledStart.slice(0, 10) : ""}
                    onChange={(e) => setScheduledStart(e.target.value)}
                  />
                </Field>

                <Field label="Scheduled End">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                    value={scheduledEnd ? scheduledEnd.slice(0, 10) : ""}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  className="min-h-[140px] w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>

              <Field label="Assigned Installer">
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

              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm text-zinc-400">Current Installer</div>
                <div className="mt-2 text-white">
                  {selectedInstaller?.full_name ||
                    job.assigned_installer_name ||
                    "No installer assigned"}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveJob}
                  disabled={savingJob}
                  className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingJob ? "Saving..." : "Save Job"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Create Work Order</h2>

            <div className="mt-5 space-y-4">
              <Field label="Title">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={woTitle}
                  onChange={(e) => setWoTitle(e.target.value)}
                  placeholder="Example: Prep and basecoat"
                />
              </Field>

              <Field label="Description">
                <textarea
                  className="min-h-[110px] w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={woDescription}
                  onChange={(e) => setWoDescription(e.target.value)}
                  placeholder="Tasks, instructions, site notes..."
                />
              </Field>

              <Field label="Materials">
                <textarea
                  className="min-h-[90px] w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={woMaterials}
                  onChange={(e) => setWoMaterials(e.target.value)}
                  placeholder="Primer, flake, topcoat, rollers..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Scheduled Date">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                    value={woScheduledDate}
                    onChange={(e) => setWoScheduledDate(e.target.value)}
                  />
                </Field>

                <Field label="Status">
                  <select
                    className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                    value={woStatus}
                    onChange={(e) =>
                      setWoStatus(e.target.value as WorkOrderStatus)
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </Field>
              </div>

              <Field label="Assign Installer">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={woAssignedInstallerId}
                  onChange={(e) => setWoAssignedInstallerId(e.target.value)}
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
                onClick={handleCreateWorkOrder}
                disabled={creatingWorkOrder}
                className="w-full rounded-lg bg-lime-400 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
              >
                {creatingWorkOrder ? "Creating..." : "Create Work Order"}
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Work Orders for This Job</h2>
            <div className="text-sm text-zinc-400">{workOrders.length} total</div>
          </div>

          <div className="mt-5 space-y-4">
            {workOrders.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-400">
                No work orders created for this job yet.
              </div>
            ) : (
              workOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {order.title || "Untitled Work Order"}
                      </div>
                      <div className="mt-1 text-sm text-zinc-400">
                        Scheduled: {order.scheduled_date || "-"}
                      </div>
                      <div className="mt-1 text-sm text-zinc-400">
                        Installer: {order.assigned_installer_name || "Unassigned"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusButton
                        active={order.status === "Open"}
                        label="Open"
                        onClick={() => handleUpdateWorkOrderStatus(order.id, "Open")}
                      />
                      <StatusButton
                        active={order.status === "In Progress"}
                        label="In Progress"
                        onClick={() =>
                          handleUpdateWorkOrderStatus(order.id, "In Progress")
                        }
                      />
                      <StatusButton
                        active={order.status === "Completed"}
                        label="Completed"
                        onClick={() =>
                          handleUpdateWorkOrderStatus(order.id, "Completed")
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <InfoCard
                      title="Description"
                      value={order.description || "No description."}
                    />
                    <InfoCard
                      title="Materials"
                      value={order.materials || "No materials listed."}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
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

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-3">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 whitespace-pre-wrap text-white">{value}</div>
    </div>
  );
}

function StatusButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
          : "border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-400/20"
      }`}
    >
      {label}
    </button>
  );
}