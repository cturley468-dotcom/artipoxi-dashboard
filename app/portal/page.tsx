"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";
import BrandMark from "../components/BrandMark";

type Profile = {
  id: string;
  email: string | null;
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

export default function PortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

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

        if (currentProfile.role === "installer") {
          router.replace("/installer");
          return;
        }

        setProfile(currentProfile as Profile);

        const { data, error } = await supabase
          .from("jobs")
          .select("id, name, customer, status, scheduled_start, scheduled_end, notes")
          .eq("customer", currentProfile.full_name || "");

        if (error) throw error;

        setJobs((data as Job[]) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <BrandMark href="/" subtitle="Customer Portal" size="md" />
          <h1 className="mt-6 text-4xl font-bold">Welcome</h1>
          <p className="mt-3 text-zinc-400">
            View your project updates, dates, and notes here.
          </p>
          {profile?.full_name && (
            <div className="mt-4 text-sm text-cyan-300">{profile.full_name}</div>
          )}
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-zinc-400">
              No projects assigned yet.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-neutral-900 p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {job.name || "Untitled Project"}
                    </div>
                    <div className="mt-2 text-zinc-400">
                      Status: {job.status || "N/A"}
                    </div>
                  </div>

                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                    {job.status || "No status"}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoCard
                    title="Scheduled Start"
                    value={job.scheduled_start || "Not scheduled"}
                  />
                  <InfoCard
                    title="Scheduled End"
                    value={job.scheduled_end || "Not scheduled"}
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm text-zinc-400">Project Notes</div>
                  <div className="mt-2 whitespace-pre-wrap text-white">
                    {job.notes || "No notes available yet."}
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

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 text-white">{value}</div>
    </div>
  );
}
