"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff" | "installer" | "customer";
};

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  status: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  notes: string | null;
};

export default function InstallerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    async function load() {
      try {
        const currentProfile = await getCurrentProfile();

        if (!currentProfile) {
          router.replace("/login");
          return;
        }

        if (currentProfile.role === "admin" || currentProfile.role === "staff") {
          router.replace("/dashboard");
          return;
        }

        if (currentProfile.role === "customer") {
          router.replace("/portal");
          return;
        }

        setProfile(currentProfile as Profile);

        const { data } = await supabase
          .from("jobs")
          .select("id, name, customer, status, scheduled_start, scheduled_end, notes");

        setJobs((data as Job[]) || []);
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-xl bg-neutral-900 p-4">Loading installer dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                Installer Portal
              </p>
              <h1 className="mt-3 text-3xl font-bold">
                Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
              </h1>
              <p className="mt-2 text-zinc-400">
                View your assigned work orders and schedule.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-zinc-400">
              No assigned work orders yet.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-neutral-900 p-6"
              >
                <h2 className="text-2xl font-bold">
                  {job.name || "Untitled Work Order"}
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Info label="Customer" value={job.customer || "-"} />
                  <Info label="Status" value={job.status || "-"} />
                  <Info label="Start Date" value={job.scheduled_start || "-"} />
                  <Info label="End Date" value={job.scheduled_end || "-"} />
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-sm text-zinc-400">Work Order Notes</div>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-zinc-200">
                    {job.notes || "No notes yet."}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-1 font-medium text-white">{value}</div>
    </div>
  );
}