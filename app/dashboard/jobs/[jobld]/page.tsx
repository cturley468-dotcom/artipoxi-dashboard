"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  status: string | null;
  notes: string | null;
};

export default function JobDetailsPage() {
  const router = useRouter();

  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔥 GET JOB ID FROM URL (this fixes your issue permanently)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "";

    console.log("URL PATH:", window.location.pathname);
    console.log("JOB ID DETECTED:", lastPart);

    setJobId(lastPart);
  }, []);

  // 🔥 LOAD JOB
  useEffect(() => {
    async function loadJob() {
      if (!jobId) return;

      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setErrorMessage("Job not found.");
          setJob(null);
        } else {
          setJob(data);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load job.");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  // 🔥 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900 p-6">
          {jobId ? `Loading job ${jobId}...` : "Reading job URL..."}
        </div>
      </div>
    );
  }

  // 🔴 ERROR STATE
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <Link href="/dashboard/jobs" className="mb-4 inline-block">
            ← Back to Jobs
          </Link>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {errorMessage}
          </div>
        </div>
      </div>
    );
  }

  // ❌ SAFETY
  if (!job) {
    return null;
  }

  // ✅ SUCCESS UI
  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/dashboard/jobs" className="inline-block">
          ← Back to Jobs
        </Link>

        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <h1 className="text-2xl font-bold text-white">
            {job.name || "Untitled Job"}
          </h1>

          <p className="mt-2 text-zinc-400">
            Customer: {job.customer || "N/A"}
          </p>

          <p className="mt-2 text-zinc-400">
            Status: {job.status || "N/A"}
          </p>

          <p className="mt-4 text-zinc-300">
            {job.notes || "No notes available."}
          </p>
        </div>
      </div>
    </div>
  );
}
