"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  status: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
};

type ViewMode = "month" | "week";

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatWeekRange(days: Date[]) {
  if (days.length === 0) return "";
  const first = days[0];
  const last = days[days.length - 1];

  const firstText = first.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const lastText = last.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${firstText} - ${lastText}`;
}

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const firstCalendarDay = new Date(year, month, 1 - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay);
    date.setDate(firstCalendarDay.getDate() + index);
    return date;
  });
}

function getWeekDays(viewDate: Date) {
  const base = new Date(viewDate);
  const dayOfWeek = base.getDay();
  const startOfWeek = new Date(base);
  startOfWeek.setDate(base.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isJobOnDay(job: Job, day: Date) {
  if (!job.scheduled_start) return false;

  const dayStr = toDateOnlyString(day);
  const start = job.scheduled_start;
  const end = job.scheduled_end || job.scheduled_start;

  return dayStr >= start && dayStr <= end;
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "New":
      return "border-cyan-400/25 bg-cyan-500/10 text-cyan-300";
    case "Quoted":
      return "border-violet-400/25 bg-violet-500/10 text-violet-300";
    case "Follow Up":
      return "border-amber-400/25 bg-amber-500/10 text-amber-300";
    case "Scheduled":
      return "border-sky-400/25 bg-sky-500/10 text-sky-300";
    case "In Progress":
      return "border-orange-400/25 bg-orange-500/10 text-orange-300";
    case "Completed":
      return "border-lime-400/25 bg-lime-500/10 text-lime-300";
    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("id, name, customer, status, scheduled_start, scheduled_end")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load schedule jobs error:", error);
      setJobs([]);
    } else {
      setJobs((data as Job[]) || []);
    }

    setLoading(false);
  }

  async function moveJobToDate(jobId: string, dateString: string) {
    setSavingJobId(jobId);

    const { error } = await supabase
      .from("jobs")
      .update({
        scheduled_start: dateString,
        scheduled_end: dateString,
      })
      .eq("id", jobId);

    setSavingJobId(null);
    setDragOverDate(null);

    if (error) {
      console.error("Schedule update error:", error);
      alert(error.message);
      return;
    }

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              scheduled_start: dateString,
              scheduled_end: dateString,
            }
          : job
      )
    );
  }

  async function clearSchedule(jobId: string) {
    setSavingJobId(jobId);

    const { error } = await supabase
      .from("jobs")
      .update({
        scheduled_start: null,
        scheduled_end: null,
      })
      .eq("id", jobId);

    setSavingJobId(null);

    if (error) {
      console.error("Clear schedule error:", error);
      alert(error.message);
      return;
    }

    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              scheduled_start: null,
              scheduled_end: null,
            }
          : job
      )
    );
  }

  function handleDragStart(jobId: string) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", jobId);
      event.dataTransfer.effectAllowed = "move";
    };
  }

  function handleDropOnDay(dateString: string) {
    return async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const jobId = event.dataTransfer.getData("text/plain");
      if (!jobId) return;

      await moveJobToDate(jobId, dateString);
    };
  }

  const monthDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const weekDays = useMemo(() => getWeekDays(viewDate), [viewDate]);
  const visibleDays = viewMode === "month" ? monthDays : weekDays;

  const unscheduledJobs = useMemo(
    () => jobs.filter((job) => !job.scheduled_start),
    [jobs]
  );

  const headingText =
    viewMode === "month"
      ? formatMonthYear(viewDate)
      : formatWeekRange(weekDays);

  function goPrev() {
    if (viewMode === "month") {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
      );
    } else {
      const next = new Date(viewDate);
      next.setDate(viewDate.getDate() - 7);
      setViewDate(next);
    }
  }

  function goNext() {
    if (viewMode === "month") {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
      );
    } else {
      const next = new Date(viewDate);
      next.setDate(viewDate.getDate() + 7);
      setViewDate(next);
    }
  }

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Schedule
          </p>
          <h1 className="mt-2 text-3xl font-bold">Job Calendar</h1>
          <p className="mt-2 text-zinc-400">
            Drag jobs onto a day to schedule them. Switch between month and week
            view anytime.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 text-sm ${
                viewMode === "month"
                  ? "bg-cyan-500 text-black"
                  : "text-white hover:bg-white/5"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 text-sm ${
                viewMode === "week"
                  ? "bg-cyan-500 text-black"
                  : "text-white hover:bg-white/5"
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={goPrev}
            className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-2 hover:border-cyan-400"
          >
            Prev
          </button>

          <button
            onClick={() => setViewDate(new Date())}
            className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-2 hover:border-cyan-400"
          >
            Today
          </button>

          <button
            onClick={goNext}
            className="rounded-lg border border-white/10 bg-neutral-900 px-4 py-2 hover:border-cyan-400"
          >
            Next
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-2xl font-bold">{headingText}</div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Legend label="New" classes={getStatusClasses("New")} />
            <Legend label="Quoted" classes={getStatusClasses("Quoted")} />
            <Legend label="Follow Up" classes={getStatusClasses("Follow Up")} />
            <Legend label="Scheduled" classes={getStatusClasses("Scheduled")} />
            <Legend label="In Progress" classes={getStatusClasses("In Progress")} />
            <Legend label="Completed" classes={getStatusClasses("Completed")} />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-black/30 p-6 text-zinc-300">
            Loading schedule...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {visibleDays.map((day) => {
              const dateString = toDateOnlyString(day);
              const jobsForDay = jobs.filter((job) => isJobOnDay(job, day));
              const inCurrentMonth =
                viewMode === "week" ? true : isSameMonth(day, viewDate);
              const isToday = dateString === toDateOnlyString(new Date());
              const isDragTarget = dragOverDate === dateString;

              return (
                <div
                  key={day.toISOString()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverDate(dateString);
                  }}
                  onDragLeave={() => {
                    if (dragOverDate === dateString) setDragOverDate(null);
                  }}
                  onDrop={handleDropOnDay(dateString)}
                  className={`h-[220px] rounded-xl border p-2 transition ${
                    inCurrentMonth
                      ? "border-white/10 bg-black/20"
                      : "border-white/5 bg-black/10 opacity-60"
                  } ${isDragTarget ? "border-cyan-400 bg-cyan-500/10" : ""}`}
                >
                  <div className="mb-2">
                    <div
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold ${
                        isToday ? "bg-cyan-500 text-black" : "text-white"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>

                  <div className="h-[160px] space-y-1 overflow-y-auto pr-1">
                    {jobsForDay.map((job) => (
                      <div
                        key={`${job.id}-${dateString}`}
                        draggable
                        onDragStart={handleDragStart(job.id)}
                        className={`rounded-md border px-2 py-1 ${getStatusClasses(
                          job.status
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="min-w-0 flex-1 hover:underline"
                            title={job.name || "Untitled Job"}
                          >
                            <div className="truncate text-[11px] font-semibold">
                              {job.name || "Untitled Job"}
                            </div>
                            <div className="truncate text-[10px] text-zinc-200">
                              {job.customer || "No customer"}
                            </div>
                            <div className="truncate text-[10px] text-zinc-300/80">
                              {job.status || "No status"}
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={() => clearSchedule(job.id)}
                            className="shrink-0 rounded border border-red-400/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-200 hover:bg-red-500/20"
                            title="Unschedule"
                          >
                            ×
                          </button>
                        </div>

                        <div className="mt-1 text-[10px] text-zinc-200/70">
                          {savingJobId === job.id ? "Saving..." : "Drag to move"}
                        </div>
                      </div>
                    ))}

                    {jobsForDay.length === 0 && (
                      <div className="pt-1 text-[11px] text-zinc-600">
                        Drop jobs here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
        <h2 className="mb-4 text-xl font-semibold">Unscheduled Jobs</h2>

        {unscheduledJobs.length === 0 ? (
          <div className="rounded-lg bg-black/30 p-4 text-zinc-400">
            All jobs currently have schedule dates.
          </div>
        ) : (
          <div className="space-y-3">
            {unscheduledJobs.map((job) => (
              <div
                key={job.id}
                draggable
                onDragStart={handleDragStart(job.id)}
                className={`rounded-xl border bg-black/20 p-4 hover:border-cyan-400 ${getStatusClasses(
                  job.status
                )}`}
              >
                <div className="font-semibold">{job.name || "Untitled Job"}</div>
                <div className="text-sm text-zinc-200">
                  {job.customer || "No customer"}
                </div>
                <div className="mt-1 text-xs text-zinc-200/80">
                  {job.status || "No status"}
                </div>
                <div className="mt-2 text-sm text-yellow-200">
                  Not scheduled yet
                </div>
                <div className="mt-2 text-xs text-zinc-200/70">
                  Drag this card onto a calendar day
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({
  label,
  classes,
}: {
  label: string;
  classes: string;
}) {
  return <div className={`rounded-md border px-2 py-1 ${classes}`}>{label}</div>;
}
