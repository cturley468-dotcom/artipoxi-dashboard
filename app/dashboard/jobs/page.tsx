"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  quoted_price: number | null;
  materials_cost: number | null;
  labor_cost: number | null;
  misc_cost: number | null;
  created_at?: string | null;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");
  const [quotedPrice, setQuotedPrice] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load jobs error:", error);
      setJobs([]);
    } else {
      setJobs((data as Job[]) || []);
    }

    setLoading(false);
  }

  async function addJob() {
    if (!name.trim() || !customer.trim()) {
      alert("Enter a job name and customer.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("jobs").insert([
      {
        name: name.trim(),
        customer: customer.trim(),
        status,
        quoted_price: Number(quotedPrice) || 0,
        materials_cost: 0,
        labor_cost: 0,
        misc_cost: 0,
      },
    ]);

    if (error) {
      console.error("Add job error:", error);
      alert(error.message);
    } else {
      setName("");
      setCustomer("");
      setStatus("New");
      setQuotedPrice("");
      fetchJobs();
    }

    setSaving(false);
  }

  async function deleteJob(id: string) {
    const confirmed = window.confirm("Delete this job?");
    if (!confirmed) return;

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Delete job error:", error);
      alert(error.message);
    } else {
      setJobs((current) => current.filter((job) => job.id !== id));
    }
  }

  return (
    <div className="p-6 text-white space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Jobs
        </p>
        <h1 className="mt-2 text-3xl font-bold">Job Management</h1>
        <p className="mt-2 text-zinc-400">
          Add jobs, open job cards, and manage active work.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-900 p-5 space-y-4">
        <h2 className="text-lg font-semibold">Add New Job</h2>

        <input
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none"
          placeholder="Job name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none"
          placeholder="Customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />

        <input
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none"
          placeholder="Quoted price"
          type="number"
          value={quotedPrice}
          onChange={(e) => setQuotedPrice(e.target.value)}
        />

        <select
          className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
        >
          <option>New</option>
          <option>Quoted</option>
          <option>Follow Up</option>
          <option>Scheduled</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <button
          onClick={addJob}
          disabled={saving}
          className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Job"}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Job List</h2>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
            No jobs found.
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-white/10 bg-neutral-900 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    {job.name || "Untitled Job"}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {job.customer || "No customer"}
                  </div>
                  <div className="mt-2 text-sm text-cyan-300">
                    Status: {job.status || "New"}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">
                    Quoted: ${Number(job.quoted_price || 0).toLocaleString()}
                  </div>
                  <div className="mt-1 break-all text-xs text-zinc-500">
                    ID: {job.id}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-black hover:bg-cyan-400"
                  >
                    Open Job
                  </Link>

                  <button
                    onClick={() => deleteJob(job.id)}
                    className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 font-medium text-red-300 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}