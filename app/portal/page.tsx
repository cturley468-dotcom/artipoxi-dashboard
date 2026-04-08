"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "../components/BrandMark";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

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
  const [message, setMessage] = useState("");

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
          .eq("customer", currentProfile.full_name || "")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setJobs((data as Job[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load portal.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading portal...
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-6">
          <section className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <BrandMark href="/" subtitle="Customer Portal" size="md" />

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="section-kicker">Project Access</div>
                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                  View your project status, dates, and notes from one clean client
                  portal.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="ui-chip ui-chip-cyan">Customer Access</span>
                <span className="ui-chip">{jobs.length} Project{jobs.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </section>

          {message && (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}

          <section className="space-y-4">
            {jobs.length === 0 ? (
              <div className="glass-panel-soft rounded-[28px] p-6 text-zinc-400">
                No projects assigned yet.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel-soft rounded-[28px] p-5 md:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-2xl font-black tracking-tight text-white md:text-3xl">
                        {job.name || "Untitled Project"}
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">
                        {job.customer || "No customer listed"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="ui-chip ui-chip-cyan">
                        {job.status || "No status"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <InfoCard
                      title="Scheduled Start"
                      value={job.scheduled_start ? formatDate(job.scheduled_start) : "Not scheduled"}
                    />
                    <InfoCard
                      title="Scheduled End"
                      value={job.scheduled_end ? formatDate(job.scheduled_end) : "Not scheduled"}
                    />
                  </div>

                  <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      Project Notes
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white md:text-base">
                      {job.notes || "No notes available yet."}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-3 text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
