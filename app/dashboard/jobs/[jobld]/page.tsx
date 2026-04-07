"use client";

import { useEffect, useState } from "react";
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

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [installersLoading, setInstallersLoading] = useState(true);

  const [job, setJob] = useState<Job | null>(null);
  const [installers, setInstallers] = useState<Profile[]>([]);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedInstallerId, setAssignedInstallerId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const currentProfile = await getCurrentProfile();

        if (!currentProfile) {
          router.replace("/login");
          return;
        }

        if (currentProfile.role !== "admin" && currentProfile.role !== "staff") {
          router.replace("/auth/callback");
          return;
        }

        const [{ data: jobData, error: jobError }, { data: installersData, error: installersError }] =
          await Promise.all([
            supabase
              .from("jobs")
              .select(
                "id, name, customer, status, scheduled_start, scheduled_end, notes, assigned_installer_id, assigned_installer_name"
              )
              .eq("id", jobId)
              .single(),
            supabase
              .from("profiles")
              .select("id, email, full_name, role")
              .eq("role", "installer")
              .order("full_name", { ascending: true }),
          ]);

        if (jobError) throw jobError;
        if (installersError) throw installersError;

        const loadedJob = jobData as Job;
        const loadedInstallers = (installersData as Profile[]) || [];

        setJob(loadedJob);
        setInstallers(loadedInstallers);

        setName(loadedJob.name || "");
        setCustomer(loadedJob.customer || "");
        setStatus((loadedJob.status as JobStatus) || "New");
        setScheduledStart(loadedJob.scheduled_start || "");
        setScheduledEnd(loadedJob.scheduled_end || "");
        setNotes(loadedJob.notes || "");
        setAssignedInstallerId(loadedJob.assigned_installer_id || "");

        setInstallersLoading(false);
        setLoading(false);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load job.");
        setInstallersLoading(false);
        setLoading(false);
      }
    }

    if (jobId) load();
  }, [jobId, router]);

  async function handleSave() {
    if (!job) return;

    setSaving(true);
    setMessage("");

    try {
      const selectedInstaller =
        installers.find((installer) => installer.id === assignedInstallerId) || null;

      const updates = {
        name: name || null,
        customer: customer || null,
        status,
        scheduled_start: scheduledStart || null,
        scheduled_end: scheduledEnd || null,
        notes: notes || null,
        assigned_installer_id: assignedInstallerId || null,
        assigned_installer_name: selectedInstaller?.full_name || null,
      };

      const { data, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", job.id)
        .select(
          "id, name, customer, status, scheduled_start, scheduled_end, notes, assigned_installer_id, assigned_installer_name"
        )
        .single();

      if (error) throw error;

      const updatedJob = data as Job;
      setJob(updatedJob);
      setMessage("Job updated successfully.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to save job.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading job...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          Job not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Job Details
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {job.name || "Untitled Job"}
            </h1>
          </div>

          <Link
            href="/dashboard/jobs"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30"
          >
            Back to Jobs
          </Link>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
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
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Installer Assignment</h2>

            <div className="mt-5 space-y-4">
              <Field label="Assigned Installer">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
                  value={assignedInstallerId}
                  onChange={(e) => setAssignedInstallerId(e.target.value)}
                  disabled={installersLoading}
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
                <div className="text-sm text-zinc-400">Current Assignment</div>
                <div className="mt-2 text-white">
                  {job.assigned_installer_name || "No installer assigned"}
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-zinc-200">
                Installers will only see jobs assigned to their own profile.
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Job"}
          </button>
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