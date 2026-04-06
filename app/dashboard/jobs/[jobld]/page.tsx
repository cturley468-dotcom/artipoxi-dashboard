"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

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
  quoted_price: number | null;
  materials_cost: number | null;
  labor_cost: number | null;
  misc_cost: number | null;
  notes: string | null;
  before_photos: string[] | null;
  after_photos: string[] | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
};

function getRouteJobId(params: ReturnType<typeof useParams>): string {
  const raw = (params?.jobId ?? params?.id) as string | string[] | undefined;

  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw[0]?.trim()) return raw[0].trim();

  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== "jobs") return last;
  }

  return "";
}

export default function JobDetailPage() {
  const params = useParams();
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const resolvedId = getRouteJobId(params);
    setJobId(resolvedId);
  }, [params]);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setErrorMessage("");

      if (!jobId) {
        setErrorMessage("No job ID found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setJob(null);
      } else if (!data) {
        setErrorMessage("No job found with this ID.");
        setJob(null);
      } else {
        setJob(data as Job);
      }

      setLoading(false);
    }

    fetchJob();
  }, [jobId]);

  const totalCost = useMemo(() => {
    if (!job) return 0;
    return (
      Number(job.materials_cost || 0) +
      Number(job.labor_cost || 0) +
      Number(job.misc_cost || 0)
    );
  }, [job]);

  const profit = useMemo(() => {
    if (!job) return 0;
    return Number(job.quoted_price || 0) - totalCost;
  }, [job, totalCost]);

  const margin = useMemo(() => {
    if (!job) return 0;
    const quoted = Number(job.quoted_price || 0);
    if (quoted <= 0) return 0;
    return (profit / quoted) * 100;
  }, [job, profit]);

  const durationDays = useMemo(() => {
    if (!job?.scheduled_start || !job?.scheduled_end) return 0;
    const start = new Date(job.scheduled_start + "T00:00:00");
    const end = new Date(job.scheduled_end + "T00:00:00");
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [job]);

  function updateField<K extends keyof Job>(field: K, value: Job[K]) {
    setJob((current) => (current ? { ...current, [field]: value } : current));
  }

  async function saveJob() {
    if (!job) return;

    if (
      job.scheduled_start &&
      job.scheduled_end &&
      job.scheduled_end < job.scheduled_start
    ) {
      alert("End date cannot be before start date.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const nextStatus =
      job.scheduled_start && job.status === "New" ? "Scheduled" : job.status;

    const { error } = await supabase
      .from("jobs")
      .update({
        name: job.name,
        customer: job.customer,
        status: nextStatus,
        quoted_price: Number(job.quoted_price || 0),
        materials_cost: Number(job.materials_cost || 0),
        labor_cost: Number(job.labor_cost || 0),
        misc_cost: Number(job.misc_cost || 0),
        notes: job.notes ?? "",
        scheduled_start: job.scheduled_start || null,
        scheduled_end: job.scheduled_end || null,
      })
      .eq("id", job.id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      alert(error.message);
    } else {
      setJob((current) =>
        current ? { ...current, status: nextStatus } : current
      );
      alert("Project saved");
    }
  }

  function quickSetOneDay() {
    const today = new Date().toISOString().split("T")[0];
    setJob((current) =>
      current
        ? {
            ...current,
            scheduled_start: today,
            scheduled_end: today,
            status: current.status === "New" ? "Scheduled" : current.status,
          }
        : current
    );
  }

  function clearSchedule() {
    setJob((current) =>
      current
        ? {
            ...current,
            scheduled_start: null,
            scheduled_end: null,
          }
        : current
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="rounded-lg bg-neutral-900 p-4">Loading project...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4 p-6 text-white">
        <h1 className="text-2xl font-bold text-red-400">Project not found</h1>
        <div className="rounded-lg bg-red-900/40 p-4">{errorMessage}</div>
        <div className="rounded-lg bg-neutral-900 p-4 text-sm text-zinc-400">
          Route ID: {jobId || "none"}
        </div>
        <div className="rounded-lg bg-neutral-900 p-4 text-sm text-zinc-400">
          URL: {typeof window !== "undefined" ? window.location.pathname : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Project Profile
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            {job.name || "Untitled Project"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">ID: {job.id}</p>
        </div>

        <button
          onClick={saveJob}
          disabled={saving}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-black disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Project"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-900/40 p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold">Project Info</h2>

            <Field label="Project Name">
              <input
                value={job.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Customer">
              <input
                value={job.customer ?? ""}
                onChange={(e) => updateField("customer", e.target.value)}
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Status">
              <select
                value={job.status ?? "New"}
                onChange={(e) =>
                  updateField("status", e.target.value as JobStatus)
                }
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option>New</option>
                <option>Quoted</option>
                <option>Follow Up</option>
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </Field>

            <Field label="Quoted Price">
              <input
                type="number"
                value={job.quoted_price ?? 0}
                onChange={(e) =>
                  updateField("quoted_price", Number(e.target.value) || 0)
                }
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Materials Cost">
              <input
                type="number"
                value={job.materials_cost ?? 0}
                onChange={(e) =>
                  updateField("materials_cost", Number(e.target.value) || 0)
                }
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Labor Cost">
              <input
                type="number"
                value={job.labor_cost ?? 0}
                onChange={(e) =>
                  updateField("labor_cost", Number(e.target.value) || 0)
                }
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>

            <Field label="Misc Cost">
              <input
                type="number"
                value={job.misc_cost ?? 0}
                onChange={(e) =>
                  updateField("misc_cost", Number(e.target.value) || 0)
                }
                className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Scheduling</h2>

              <div className="flex gap-2">
                <button
                  onClick={quickSetOneDay}
                  type="button"
                  className="rounded border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
                >
                  One Day
                </button>
                <button
                  onClick={clearSchedule}
                  type="button"
                  className="rounded border border-red-400/20 bg-red-500/10 px-3 py-1 text-sm text-red-300"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Date">
                <input
                  type="date"
                  value={job.scheduled_start ?? ""}
                  onChange={(e) =>
                    updateField("scheduled_start", e.target.value || null)
                  }
                  className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </Field>

              <Field label="End Date">
                <input
                  type="date"
                  value={job.scheduled_end ?? ""}
                  onChange={(e) =>
                    updateField("scheduled_end", e.target.value || null)
                  }
                  className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
                />
              </Field>
            </div>

            <div className="rounded border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">
              <div>
                Start:{" "}
                <span className="font-medium text-white">
                  {job.scheduled_start || "-"}
                </span>
              </div>
              <div className="mt-1">
                End:{" "}
                <span className="font-medium text-white">
                  {job.scheduled_end || "-"}
                </span>
              </div>
              <div className="mt-1">
                Duration:{" "}
                <span className="font-medium text-cyan-300">
                  {durationDays > 0 ? `${durationDays} day(s)` : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold">Notes</h2>

            <textarea
              value={job.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={8}
              placeholder="Add project notes here..."
              className="w-full rounded border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="space-y-4 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold">Project Photos</h2>

            <PhotoSection title="Before Photos" photos={job.before_photos} />
            <PhotoSection title="After Photos" photos={job.after_photos} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold">Numbers</h2>

            <SummaryRow
              label="Quoted"
              value={`$${Number(job.quoted_price || 0).toLocaleString()}`}
            />
            <SummaryRow
              label="Materials"
              value={`$${Number(job.materials_cost || 0).toLocaleString()}`}
            />
            <SummaryRow
              label="Labor"
              value={`$${Number(job.labor_cost || 0).toLocaleString()}`}
            />
            <SummaryRow
              label="Misc"
              value={`$${Number(job.misc_cost || 0).toLocaleString()}`}
            />
            <SummaryRow
              label="Total Cost"
              value={`$${totalCost.toLocaleString()}`}
            />
            <SummaryRow
              label="Profit"
              value={`$${profit.toLocaleString()}`}
              tone="cyan"
            />
            <SummaryRow
              label="Margin"
              value={`${margin.toFixed(1)}%`}
              tone="lime"
            />
          </div>

          <div className="space-y-3 rounded-lg border border-white/10 bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold">Schedule Summary</h2>
            <SummaryRow label="Status" value={job.status || "-"} />
            <SummaryRow label="Start" value={job.scheduled_start || "-"} />
            <SummaryRow label="End" value={job.scheduled_end || "-"} />
            <SummaryRow
              label="Duration"
              value={durationDays > 0 ? `${durationDays} day(s)` : "-"}
            />
          </div>
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
    <label className="block space-y-2">
      <div className="text-sm text-zinc-400">{label}</div>
      {children}
    </label>
  );
}

function SummaryRow({
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
    <div className="flex items-center justify-between border-b border-neutral-800 py-2">
      <span className="text-zinc-400">{label}</span>
      <span className={`font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

function PhotoSection({
  title,
  photos,
}: {
  title: string;
  photos: string[] | null | undefined;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-zinc-300">{title}</div>

      {!photos || photos.length === 0 ? (
        <div className="rounded border border-white/10 bg-black/30 p-4 text-sm text-zinc-500">
          No photos yet
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <a
              key={`${title}-${index}`}
              href={photo}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded border border-white/10 bg-black/30"
            >
              <img
                src={photo}
                alt={`${title} ${index + 1}`}
                className="h-48 w-full object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
