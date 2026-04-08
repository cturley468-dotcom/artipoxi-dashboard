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

type CalendarCell = {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  jobs: Job[];
};

export default function SchedulePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));

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

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const start = new Date(firstDay);
    const startWeekday = start.getDay();
    start.setDate(start.getDate() - startWeekday);

    const end = new Date(lastDay);
    const endWeekday = end.getDay();
    end.setDate(end.getDate() + (6 - endWeekday));

    const cells: CalendarCell[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = formatDateKey(cursor);
      const dayJobs = jobs.filter((job) => {
        if (!job.scheduled_start) return false;
        return formatDateKey(new Date(job.scheduled_start)) === key;
      });

      cells.push({
        key,
        date: new Date(cursor),
        inMonth: cursor.getMonth() === currentMonth.getMonth(),
        isToday: key === formatDateKey(today),
        jobs: dayJobs,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return cells;
  }, [currentMonth, jobs]);

  const selectedJobs = useMemo(() => {
    return calendarCells.find((c) => c.key === selectedDateKey)?.jobs || [];
  }, [calendarCells, selectedDateKey]);

  const upcomingJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => !!job.scheduled_start)
      .sort((a, b) => {
        const aTime = a.scheduled_start ? new Date(a.scheduled_start).getTime() : 0;
        const bTime = b.scheduled_start ? new Date(b.scheduled_start).getTime() : 0;
        return aTime - bTime;
      })
      .slice(0, 8);
  }, [jobs]);

  function changeMonth(direction: -1 | 1) {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1)
    );
  }

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
                View scheduled jobs in a real calendar layout and tap any day to
                see assigned work.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="ui-btn">
                Prev
              </button>
              <div className="ui-chip">{monthLabel}</div>
              <button onClick={() => changeMonth(1)} className="ui-btn">
                Next
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="mb-3 grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="rounded-[12px] border border-white/10 bg-white/[0.03] px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 md:text-xs"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                const isSelected = cell.key === selectedDateKey;

                return (
                  <button
                    key={cell.key}
                    onClick={() => setSelectedDateKey(cell.key)}
                    className={`min-h-[82px] rounded-[16px] border p-2 text-left transition md:min-h-[110px] md:p-3 ${
                      isSelected
                        ? "border-cyan-400/30 bg-cyan-400/12 shadow-[0_0_20px_rgba(73,230,255,0.08)]"
                        : "border-white/10 bg-black/20 hover:border-cyan-400/18"
                    } ${!cell.inMonth ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm font-bold ${
                          cell.isToday ? "text-cyan-300" : "text-white"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {cell.jobs.length > 0 && (
                        <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 md:text-xs">
                          {cell.jobs.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {cell.jobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className="truncate rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-zinc-300 md:text-xs"
                        >
                          {job.name || "Job"}
                        </div>
                      ))}

                      {cell.jobs.length > 2 && (
                        <div className="text-[10px] text-zinc-500 md:text-xs">
                          +{cell.jobs.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="glass-panel-soft rounded-[28px] p-4 md:p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="section-kicker">Selected Day</div>
            <div className="mt-3 panel-title">
              {new Date(selectedDateKey + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="mt-5 space-y-3">
              {selectedJobs.length === 0 ? (
                <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  No jobs scheduled for this day.
                </div>
              ) : (
                selectedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-[18px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="text-base font-bold text-white">
                      {job.name || "Untitled Job"}
                    </div>
                    <div className="mt-1 text-sm text-zinc-400">
                      {job.customer || "No customer"}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="ui-chip">{job.status || "No status"}</span>
                      {job.assigned_installer_name && (
                        <span className="ui-chip ui-chip-cyan">
                          {job.assigned_installer_name}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2">
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
                ))
              )}
            </div>

            <div className="mt-6">
              <div className="panel-title text-lg">Upcoming Jobs</div>
              <div className="mt-3 space-y-2">
                {upcomingJobs.length === 0 ? (
                  <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                    No upcoming jobs.
                  </div>
                ) : (
                  upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-[16px] border border-white/10 bg-black/20 p-3"
                    >
                      <div className="text-sm font-semibold text-white">
                        {job.name || "Untitled Job"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {job.scheduled_start
                          ? new Date(job.scheduled_start).toLocaleDateString()
                          : "No date"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
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
