"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../../lib/auth";
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
  scheduled_start: string | null;
  scheduled_end: string | null;
  assigned_installer_name?: string | null;
};

type CalendarDay = {
  key: string;
  label: string;
  shortLabel: string;
  date: Date;
  jobs: Job[];
};

export default function SchedulePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"week" | "list">("week");

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

        const { data, error } = await supabase
          .from("jobs")
          .select("id, name, customer, status, scheduled_start, scheduled_end, assigned_installer_name")
          .not("scheduled_start", "is", null)
          .order("scheduled_start", { ascending: true });

        if (error) throw error;

        setJobs((data as Job[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const weekDays = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const weekday = start.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const key = formatDateKey(date);

      const jobsForDay = jobs.filter((job) => {
        if (!job.scheduled_start) return false;
        return formatDateKey(new Date(job.scheduled_start)) === key;
      });

      days.push({
        key,
        date,
        label: date.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        shortLabel: date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        jobs: jobsForDay,
      });
    }

    return days;
  }, [jobs]);

  const upcomingJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => !!job.scheduled_start)
      .sort((a, b) => {
        const aTime = a.scheduled_start ? new Date(a.scheduled_start).getTime() : 0;
        const bTime = b.scheduled_start ? new Date(b.scheduled_start).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 12);
  }, [jobs]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="section-kicker">Schedule</div>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Project Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                View scheduled jobs by week or switch to a simplified list view
                for easier mobile use.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView("week")}
                className={`rounded-[14px] border px-4 py-2 text-sm font-semibold transition ${
                  view === "week"
                    ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-300"
                    : "border-white/10 bg-black/20 text-zinc-300"
                }`}
              >
                Week View
              </button>

              <button
                onClick={() => setView("list")}
                className={`rounded-[14px] border px-4 py-2 text-sm font-semibold transition ${
                  view === "list"
                    ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-300"
                    : "border-white/10 bg-black/20 text-zinc-300"
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        {view === "week" ? (
          <>
            <section className="hidden gap-4 xl:grid xl:grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day.key}
                  className="glass-panel-soft min-h-[460px] rounded-[24px] p-4"
                >
                  <div className="border-b border-white/10 pb-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      {day.date.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div className="mt-2 text-lg font-bold text-white">
                      {day.date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {day.jobs.length === 0 ? (
                      <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                        No jobs scheduled
                      </div>
                    ) : (
                      day.jobs.map((job) => (
                        <ScheduleCard key={job.id} job={job} compact />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-4 xl:hidden">
              {weekDays.map((day) => (
                <div
                  key={day.key}
                  className="glass-panel-soft rounded-[24px] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                        {day.date.toLocaleDateString(undefined, { weekday: "long" })}
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {day.shortLabel}
                      </div>
                    </div>

                    <span className="ui-chip">
                      {day.jobs.length} Job{day.jobs.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {day.jobs.length === 0 ? (
                      <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                        No jobs scheduled
                      </div>
                    ) : (
                      day.jobs.map((job) => <ScheduleCard key={job.id} job={job} />)
                    )}
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-4">
              <div className="panel-title">Upcoming Scheduled Jobs</div>
              <div className="panel-subtitle mt-1 text-sm">
                Simplified layout for faster scrolling and phone use.
              </div>
            </div>

            <div className="space-y-3">
              {upcomingJobs.length === 0 ? (
                <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                  No scheduled jobs found.
                </div>
              ) : (
                upcomingJobs.map((job) => <ScheduleCard key={job.id} job={job} />)
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ScheduleCard({
  job,
  compact = false,
}: {
  job: Job;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border border-white/10 bg-black/20 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div>
          <div className={`${compact ? "text-sm" : "text-base"} font-bold text-white`}>
            {job.name || "Untitled Job"}
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {job.customer || "No customer"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="ui-chip">{job.status || "No status"}</span>
          {job.assigned_installer_name && (
            <span className="ui-chip ui-chip-cyan">
              {job.assigned_installer_name}
            </span>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoMini
            title="Start"
            value={
              job.scheduled_start
                ? new Date(job.scheduled_start).toLocaleDateString()
                : "Not set"
            }
          />
          <InfoMini
            title="End"
            value={
              job.scheduled_end
                ? new Date(job.scheduled_end).toLocaleDateString()
                : "Not set"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoMini({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
