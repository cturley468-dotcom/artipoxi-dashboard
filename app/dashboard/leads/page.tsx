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

type LeadJob = {
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

export default function LeadsPage() {
  const [jobs, setJobs] = useState<LeadJob[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setJobs([]);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as LeadJob[];
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

  const leads = useMemo(() => {
    return jobs.filter((job) =>
      ["New", "Quoted", "Follow Up"].includes(job.status)
    );
  }, [jobs]);

  const stats = useMemo(() => {
    const newLeads = leads.filter((lead) => lead.status === "New").length;
    const quoted = leads.filter((lead) => lead.status === "Quoted").length;
    const followUp = leads.filter((lead) => lead.status === "Follow Up").length;
    const pipelineValue = leads.reduce((sum, lead) => sum + lead.quotedPrice, 0);

    return {
      newLeads,
      quoted,
      followUp,
      pipelineValue,
    };
  }, [leads]);

  function updateStatus(id: string, status: JobStatus) {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, status } : job))
    );
  }

  function removeLead(id: string) {
    setJobs((current) => current.filter((job) => job.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Leads
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Lead Pipeline</h1>
        <p className="mt-2 text-zinc-400">
          Track incoming opportunities, quoted projects, and follow-ups.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="New Leads" value={`${stats.newLeads}`} tone="cyan" />
        <StatCard title="Quoted" value={`${stats.quoted}`} tone="yellow" />
        <StatCard title="Follow Up" value={`${stats.followUp}`} />
        <StatCard
          title="Pipeline Value"
          value={`$${stats.pipelineValue.toLocaleString()}`}
          tone="lime"
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Lead List</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Move leads through the pipeline or open the full job card.
            </p>
          </div>

          <Link
            href="/configurator"
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-400/20"
          >
            Open Configurator
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {leads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-zinc-400">
              No active leads right now. New configurator submissions and manual
              jobs with New, Quoted, or Follow Up status will appear here.
            </div>
          ) : (
            leads.map((lead) => {
              const totalCost =
                lead.materialsCost + lead.laborCost + lead.miscCost;
              const projectedProfit = lead.quotedPrice - totalCost;
              const projectedMargin =
                lead.quotedPrice > 0
                  ? ((projectedProfit / lead.quotedPrice) * 100).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <Link
                        href={`/dashboard/jobs/${lead.id}`}
                        className="text-lg font-semibold text-white hover:text-cyan-300"
                      >
                        {lead.name}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-400">
                        {lead.customer}
                      </p>
                      <StatusBadge status={lead.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric
                        label="Quote"
                        value={`$${lead.quotedPrice.toLocaleString()}`}
                      />
                      <Metric
                        label="Projected Profit"
                        value={`$${projectedProfit.toLocaleString()}`}
                        tone="lime"
                      />
                      <Metric
                        label="Projected Margin"
                        value={`${projectedMargin}%`}
                        tone="cyan"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                    <div>
                      <div className="mb-2 text-sm text-zinc-400">Update Status</div>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(lead.id, e.target.value as JobStatus)
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      >
                        <option>New</option>
                        <option>Quoted</option>
                        <option>Follow Up</option>
                        <option>Scheduled</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </div>

                    <Link
                      href={`/dashboard/jobs/${lead.id}`}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-400/20"
                    >
                      Open Lead
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeLead(lead.id)}
                      className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300 hover:bg-red-400/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
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
  tone?: "default" | "cyan" | "lime" | "yellow";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "lime"
      ? "text-lime-300"
      : tone === "yellow"
      ? "text-yellow-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</div>
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
    status === "Quoted"
      ? "mt-3 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300"
      : status === "New"
      ? "mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
      : status === "Follow Up"
      ? "mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
      : status === "In Progress"
      ? "mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
      : status === "Completed"
      ? "mt-3 inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs text-lime-300"
      : "mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300";

  return <div className={classes}>{status}</div>;
}