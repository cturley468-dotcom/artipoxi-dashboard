"use client";

import { useEffect, useMemo, useState } from "react";

type ScheduleStatus = "scheduled" | "confirmed" | "needs_follow_up";

type ScheduleItem = {
  id: string;
  customer: string;
  location: string;
  installer: string;
  date: string;
  time: string;
  status: ScheduleStatus;
  system: string;
  sourceJobId?: string;
};

type ReadyJob = {
  id: string;
  customer: string;
  location: string;
  installer: string;
  system: string;
  preferredTime: string;
};

type ViewMode = "day" | "week" | "month" | "list";

const SCHEDULE_STORAGE_KEY = "artipoxi_schedule_v1";
const JOBS_STORAGE_KEY = "artipoxi_jobs";

const mockSchedule: ScheduleItem[] = [
  {
    id: "sch-1001",
    customer: "Anderson Garage Coating",
    location: "Anderson, SC",
    installer: "Crew A",
    date: "2026-04-14",
    time: "8:00 AM",
    status: "confirmed",
    system: "Flake System",
  },
  {
    id: "sch-1002",
    customer: "Premium Shop Floor",
    location: "Greenville, SC",
    installer: "Crew B",
    date: "2026-04-15",
    time: "9:30 AM",
    status: "scheduled",
    system: "Metallic Resin",
  },
  {
    id: "sch-1003",
    customer: "Patio Recoat Project",
    location: "Clemson, SC",
    installer: "Crew A",
    date: "2026-04-16",
    time: "10:00 AM",
    status: "needs_follow_up",
    system: "Solid Color Epoxy",
  },
  {
    id: "sch-1004",
    customer: "Commercial Entry Floor",
    location: "Spartanburg, SC",
    installer: "Crew C",
    date: "2026-04-17",
    time: "7:30 AM",
    status: "scheduled",
    system: "Commercial Flake",
  },
];

const fallbackReadyJobs: ReadyJob[] = [
  {
    id: "job-2001",
    customer: "Lake Hartwell Garage",
    location: "Hartwell, GA",
    installer: "Crew A",
    system: "Flake System",
    preferredTime: "8:30 AM",
  },
  {
    id: "job-2002",
    customer: "Modern Shop Recoat",
    location: "Greer, SC",
    installer: "Crew B",
    system: "Solid Color Epoxy",
    preferredTime: "9:00 AM",
  },
  {
    id: "job-2003",
    customer: "Outdoor Patio Upgrade",
    location: "Easley, SC",
    installer: "Crew C",
    system: "Metallic Resin",
    preferredTime: "10:30 AM",
  },
];

export default function SchedulePage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2026-04-15"));
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(mockSchedule);
  const [readyJobs, setReadyJobs] = useState<ReadyJob[]>(fallbackReadyJobs);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const rawSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (rawSchedule) {
        const parsed = JSON.parse(rawSchedule);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScheduleItems(parsed);
        }
      }
    } catch {
      // keep defaults
    }

    refreshReadyJobsFromStorage();
  }, []);

  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  function refreshReadyJobsFromStorage() {
    try {
      const rawJobs = localStorage.getItem(JOBS_STORAGE_KEY);

      if (!rawJobs) {
        setReadyJobs(fallbackReadyJobs);
        return;
      }

      const parsed = JSON.parse(rawJobs);
      if (!Array.isArray(parsed)) {
        setReadyJobs(fallbackReadyJobs);
        return;
      }

      const mapped = parsed
        .map((job: any): ReadyJob | null => {
          const id = String(job.id ?? job.job_id ?? "").trim();
          const customer = String(
            job.customer ??
              job.customer_name ??
              job.full_name ??
              job.name ??
              ""
          ).trim();

          if (!id || !customer) return null;

          const location = String(
            job.location ?? job.city ?? job.address ?? "TBD"
          ).trim();

          const installer = String(
            job.installer ?? job.crew ?? "Unassigned"
          ).trim();

          const system = String(
            job.system ?? job.project_type ?? "Epoxy System"
          ).trim();

          const preferredTime = String(
            job.preferredTime ?? job.preferred_time ?? "8:00 AM"
          ).trim();

          const alreadyScheduled =
            Boolean(job.scheduled_date) ||
            Boolean(job.schedule_date) ||
            Boolean(job.scheduledDate);

          const status = String(job.status ?? job.phase ?? "").toLowerCase();

          if (
            alreadyScheduled ||
            status.includes("completed") ||
            status.includes("closed") ||
            status.includes("archived")
          ) {
            return null;
          }

          return {
            id,
            customer,
            location,
            installer,
            system,
            preferredTime,
          };
        })
        .filter(Boolean) as ReadyJob[];

      setReadyJobs(mapped.length > 0 ? mapped : fallbackReadyJobs);
    } catch {
      setReadyJobs(fallbackReadyJobs);
    }
  }

  function updateJobStorageWhenScheduled(jobId: string, date: string, time: string) {
    try {
      const rawJobs = localStorage.getItem(JOBS_STORAGE_KEY);
      if (!rawJobs) return;

      const parsed = JSON.parse(rawJobs);
      if (!Array.isArray(parsed)) return;

      const updated = parsed.map((job: any) => {
        const currentId = String(job.id ?? job.job_id ?? "").trim();

        if (currentId !== jobId) return job;

        return {
          ...job,
          scheduled_date: date,
          scheduled_time: time,
          status: "scheduled",
        };
      });

      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore sync errors
    }
  }

  const filteredSchedule = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return scheduleItems;

    return scheduleItems.filter((item) =>
      [
        item.id,
        item.customer,
        item.location,
        item.installer,
        item.date,
        item.time,
        item.status,
        item.system,
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [search, scheduleItems]);

  const filteredReadyJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return readyJobs;

    return readyJobs.filter((job) =>
      [
        job.id,
        job.customer,
        job.location,
        job.installer,
        job.system,
        job.preferredTime,
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [search, readyJobs]);

  const scheduledCount = scheduleItems.filter((item) => item.status === "scheduled").length;
  const confirmedCount = scheduleItems.filter((item) => item.status === "confirmed").length;
  const followUpCount = scheduleItems.filter(
    (item) => item.status === "needs_follow_up"
  ).length;
  const thisWeekCount = scheduleItems.length;

  const selectedDateString = formatDateKey(selectedDate);
  const weekDates = getWeekDates(selectedDate);
  const monthDates = getMonthGridDates(selectedDate);

  const dayItems = filteredSchedule
    .filter((item) => item.date === selectedDateString)
    .sort(sortByDateTime);

  const listItems = [...filteredSchedule].sort(sortByDateTime);

  function goToday() {
    setSelectedDate(new Date());
  }

  function goPrevious() {
    setSelectedDate((current) => {
      const next = new Date(current);

      if (view === "day") next.setDate(current.getDate() - 1);
      if (view === "week") next.setDate(current.getDate() - 7);
      if (view === "month") next.setMonth(current.getMonth() - 1);
      if (view === "list") next.setDate(current.getDate() - 7);

      return next;
    });
  }

  function goNext() {
    setSelectedDate((current) => {
      const next = new Date(current);

      if (view === "day") next.setDate(current.getDate() + 1);
      if (view === "week") next.setDate(current.getDate() + 7);
      if (view === "month") next.setMonth(current.getMonth() + 1);
      if (view === "list") next.setDate(current.getDate() + 7);

      return next;
    });
  }

  function onDragStartScheduled(item: ScheduleItem, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        kind: "scheduled",
        id: item.id,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragStartReady(job: ReadyJob, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        kind: "ready",
        id: job.id,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropDate(dateKey: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOverKey(null);

    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;

      const payload = JSON.parse(raw) as { kind: "scheduled" | "ready"; id: string };

      if (payload.kind === "scheduled") {
        setScheduleItems((current) =>
          current.map((item) =>
            item.id === payload.id ? { ...item, date: dateKey } : item
          )
        );
        return;
      }

      if (payload.kind === "ready") {
        const readyJob = readyJobs.find((job) => job.id === payload.id);
        if (!readyJob) return;

        const scheduledItem: ScheduleItem = {
          id: `sch-${readyJob.id}`,
          customer: readyJob.customer,
          location: readyJob.location,
          installer: readyJob.installer,
          date: dateKey,
          time: readyJob.preferredTime,
          status: "scheduled",
          system: readyJob.system,
          sourceJobId: readyJob.id,
        };

        setScheduleItems((current) => [scheduledItem, ...current]);
        setReadyJobs((current) => current.filter((job) => job.id !== payload.id));
        updateJobStorageWhenScheduled(readyJob.id, dateKey, readyJob.preferredTime);
      }
    } catch {
      // ignore invalid drag payload
    }
  }

  function renderStatusBadge(status: ScheduleStatus) {
    const statusStyle =
      status === "confirmed"
        ? confirmedBadgeStyle
        : status === "needs_follow_up"
        ? followUpBadgeStyle
        : scheduledBadgeStyle;

    return (
      <div
        style={{
          ...statusBadgeStyle,
          ...statusStyle,
        }}
      >
        {formatStatus(status)}
      </div>
    );
  }

  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>INSTALL PLANNING</div>
          <h1 style={titleStyle}>Schedule</h1>
          <p style={subtitleStyle}>
            Keep installs organized, confirm assignments, manage upcoming work,
            and drag ready jobs straight onto the calendar.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button style={primaryActionStyle}>New Assignment</button>
        </div>
      </div>

      <div
        style={{
          ...heroCardStyle,
          ...(isMobile ? heroCardMobileStyle : null),
        }}
      >
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Schedule Snapshot</div>
          <div style={heroBigTextStyle}>Keep install days locked in.</div>
          <div style={heroTextStyle}>
            Review scheduled jobs, confirm crews, drag ready jobs into open dates,
            and keep the production calendar moving smoothly.
          </div>

          <div
            style={{
              ...viewSwitcherWrapStyle,
              ...(isMobile ? viewSwitcherWrapMobileStyle : null),
            }}
          >
            <button
              style={{
                ...viewButtonStyle,
                ...(view === "day" ? viewButtonActiveStyle : null),
              }}
              onClick={() => setView("day")}
            >
              Day
            </button>
            <button
              style={{
                ...viewButtonStyle,
                ...(view === "week" ? viewButtonActiveStyle : null),
              }}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              style={{
                ...viewButtonStyle,
                ...(view === "month" ? viewButtonActiveStyle : null),
              }}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              style={{
                ...viewButtonStyle,
                ...(view === "list" ? viewButtonActiveStyle : null),
              }}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>

        <div
          style={{
            ...heroRightStyle,
            ...(isMobile ? heroRightMobileStyle : null),
          }}
        >
          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>THIS WEEK</div>
            <div style={miniStatValueStyle}>{thisWeekCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>CONFIRMED</div>
            <div style={miniStatValueStyle}>{confirmedCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>SCHEDULED</div>
            <div style={miniStatValueStyle}>{scheduledCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>FOLLOW-UP</div>
            <div style={miniStatValueStyle}>{followUpCount}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          ...toolbarShellStyle,
          ...(isMobile ? toolbarShellMobileStyle : null),
        }}
      >
        <div
          style={{
            ...toolbarStyle,
            ...(isMobile ? toolbarMobileStyle : null),
          }}
        >
          <input
            type="text"
            placeholder="Search schedule"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle}
          />

          <div
            style={{
              ...calendarNavStyle,
              ...(isMobile ? calendarNavMobileStyle : null),
            }}
          >
            <button style={navButtonStyle} onClick={goPrevious}>
              Prev
            </button>
            <button style={navButtonStyle} onClick={goToday}>
              Today
            </button>
            <button style={navButtonStyle} onClick={goNext}>
              Next
            </button>
          </div>
        </div>

        <div style={calendarHeadingStyle}>{getViewHeading(view, selectedDate)}</div>
      </div>

      <div
        style={{
          ...pageGridStyle,
          ...(isMobile ? pageGridMobileStyle : null),
        }}
      >
        <section style={calendarSectionStyle}>
          {view === "day" && (
            <div style={dayViewStyle}>
              <div style={dayHeaderStyle}>
                <div style={dayHeaderLabelStyle}>
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div style={dayHeaderSubStyle}>
                  Drag ready jobs here to schedule them
                </div>
              </div>

              <div
                style={{
                  ...dayDropZoneStyle,
                  ...(dragOverKey === selectedDateString ? dayDropZoneActiveStyle : null),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverKey(selectedDateString);
                }}
                onDragLeave={() => setDragOverKey(null)}
                onDrop={(e) => onDropDate(selectedDateString, e)}
              >
                {dayItems.length === 0 ? (
                  <div style={emptyCalendarStyle}>No jobs scheduled for this day.</div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStartScheduled(item, e)}
                      style={calendarJobCardStyle}
                    >
                      <div style={calendarJobTopStyle}>
                        <div style={calendarJobTitleStyle}>{item.customer}</div>
                        {renderStatusBadge(item.status)}
                      </div>

                      <div style={calendarJobMetaStyle}>
                        {item.time} • {item.location}
                      </div>

                      <div style={calendarJobBottomStyle}>
                        <span>{item.installer}</span>
                        <span>{item.system}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === "week" && (
            <div
              style={{
                ...weekGridStyle,
                ...(isMobile ? weekGridMobileStyle : null),
              }}
            >
              {weekDates.map((date) => {
                const dateKey = formatDateKey(date);
                const itemsForDay = filteredSchedule
                  .filter((item) => item.date === dateKey)
                  .sort(sortByDateTime);

                return (
                  <div
                    key={dateKey}
                    style={{
                      ...weekDayCardStyle,
                      ...(dragOverKey === dateKey ? weekDayCardActiveStyle : null),
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverKey(dateKey);
                    }}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(e) => onDropDate(dateKey, e)}
                  >
                    <div style={weekDayHeaderStyle}>
                      <div style={weekDayNameStyle}>
                        {date.toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                      <div style={weekDayDateStyle}>
                        {date.toLocaleDateString(undefined, {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div style={weekJobsWrapStyle}>
                      {itemsForDay.length === 0 ? (
                        <div style={emptySmallStyle}>Drop jobs here</div>
                      ) : (
                        itemsForDay.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => onDragStartScheduled(item, e)}
                            style={weekJobPillStyle}
                          >
                            <div style={weekJobTimeStyle}>{item.time}</div>
                            <div style={weekJobCustomerStyle}>{item.customer}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "month" && (
            <div
              style={{
                ...monthGridStyle,
                ...(isMobile ? monthGridMobileStyle : null),
              }}
            >
              {monthDates.map((date) => {
                const dateKey = formatDateKey(date);
                const itemsForDay = filteredSchedule
                  .filter((item) => item.date === dateKey)
                  .sort(sortByDateTime);

                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

                return (
                  <div
                    key={dateKey}
                    style={{
                      ...monthCellStyle,
                      ...(dragOverKey === dateKey ? monthCellActiveStyle : null),
                      ...(isCurrentMonth ? null : monthCellMutedStyle),
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverKey(dateKey);
                    }}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(e) => onDropDate(dateKey, e)}
                  >
                    <div style={monthCellDateStyle}>{date.getDate()}</div>

                    <div style={monthCellJobsStyle}>
                      {itemsForDay.slice(0, isMobile ? 2 : 3).map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => onDragStartScheduled(item, e)}
                          style={monthJobChipStyle}
                        >
                          {item.customer}
                        </div>
                      ))}

                      {itemsForDay.length === 0 ? (
                        <div style={emptyTinyStyle}>Drop</div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "list" && (
            <div style={listWrapStyle}>
              {listItems.length === 0 ? (
                <div style={emptyCalendarStyle}>No scheduled jobs found.</div>
              ) : (
                listItems.map((item) => (
                  <article key={item.id} style={scheduleCardStyle}>
                    <div style={scheduleTopStyle}>
                      <div style={scheduleIdStyle}>Schedule ID: {item.id}</div>
                      {renderStatusBadge(item.status)}
                    </div>

                    <div style={scheduleTitleStyle}>{item.customer}</div>
                    <div style={scheduleMetaStyle}>{item.location}</div>

                    <div style={detailsGridStyle}>
                      <Info label="Installer" value={item.installer} />
                      <Info label="System" value={item.system} />
                      <Info label="Date" value={item.date} />
                      <Info label="Time" value={item.time} />
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        <aside style={readyJobsPanelStyle}>
          <div style={readyJobsHeaderStyle}>
            <div style={readyJobsTitleStyle}>Ready Jobs</div>
            <div style={readyJobsSubStyle}>
              Drag jobs into the calendar to schedule them
            </div>
          </div>

          <div style={readyJobsListStyle}>
            {filteredReadyJobs.length === 0 ? (
              <div style={emptyCalendarStyle}>No ready jobs available.</div>
            ) : (
              filteredReadyJobs.map((job) => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={(e) => onDragStartReady(job, e)}
                  style={readyJobCardStyle}
                >
                  <div style={readyJobTopStyle}>
                    <div style={readyJobTitleStyle}>{job.customer}</div>
                    <div style={readyJobTimeStyle}>{job.preferredTime}</div>
                  </div>

                  <div style={readyJobMetaStyle}>{job.location}</div>

                  <div style={readyJobBottomStyle}>
                    <span>{job.installer}</span>
                    <span>{job.system}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value}</div>
    </div>
  );
}

function formatStatus(status: ScheduleStatus) {
  switch (status) {
    case "needs_follow_up":
      return "needs follow-up";
    default:
      return status;
  }
}

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function sortByDateTime(a: ScheduleItem, b: ScheduleItem) {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.time.localeCompare(b.time);
}

function getWeekDates(baseDate: Date) {
  const base = new Date(baseDate);
  const day = base.getDay();
  const diff = base.getDate() - day;

  const start = new Date(base);
  start.setDate(diff);

  return Array.from({ length: 7 }).map((_, i) => {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    return next;
  });
}

function getMonthGridDates(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();

  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startDay);

  return Array.from({ length: 42 }).map((_, i) => {
    const next = new Date(gridStart);
    next.setDate(gridStart.getDate() + i);
    return next;
  });
}

function getViewHeading(view: ViewMode, selectedDate: Date) {
  if (view === "day") {
    return selectedDate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (view === "week") {
    const week = getWeekDates(selectedDate);
    const start = week[0];
    const end = week[6];

    return `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} – ${end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  if (view === "month") {
    return selectedDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  return "All Scheduled Jobs";
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#8fdfff",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "64px",
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
  maxWidth: "780px",
};

const topActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
  border: "none",
  cursor: "pointer",
};

const heroCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "16px",
  marginBottom: "18px",
  borderRadius: "24px",
  padding: "22px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const heroCardMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const heroLeftStyle: React.CSSProperties = {};

const heroSmallLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.16em",
  color: "#8fdfff",
  marginBottom: "10px",
};

const heroBigTextStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: "12px",
};

const heroTextStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.78)",
  lineHeight: 1.7,
};

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const heroRightMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const miniStatStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniStatLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const miniStatValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
};

const viewSwitcherWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "18px",
};

const viewSwitcherWrapMobileStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
};

const viewButtonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "white",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
};

const viewButtonActiveStyle: React.CSSProperties = {
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const toolbarShellStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const toolbarShellMobileStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const toolbarMobileStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};

const calendarNavStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const calendarNavMobileStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
};

const navButtonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "white",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
};

const calendarHeadingStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.82)",
  fontSize: "15px",
  fontWeight: 700,
};

const pageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.25fr 0.75fr",
  gap: "16px",
  alignItems: "start",
};

const pageGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const calendarSectionStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: 0,
};

const readyJobsPanelStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const readyJobsHeaderStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const readyJobsTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  marginBottom: "6px",
};

const readyJobsSubStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  fontSize: "14px",
};

const readyJobsListStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const readyJobCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "grab",
};

const readyJobTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "8px",
};

const readyJobTitleStyle: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 700,
  lineHeight: 1.2,
};

const readyJobTimeStyle: React.CSSProperties = {
  color: "#8fdfff",
  fontWeight: 700,
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const readyJobMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  marginBottom: "10px",
  fontSize: "14px",
};

const readyJobBottomStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  fontSize: "13px",
  color: "rgba(216,238,255,0.66)",
  flexWrap: "wrap",
};

const dayViewStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const dayHeaderStyle: React.CSSProperties = {
  marginBottom: "8px",
};

const dayHeaderLabelStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  marginBottom: "6px",
};

const dayHeaderSubStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  fontSize: "14px",
};

const dayDropZoneStyle: React.CSSProperties = {
  minHeight: "280px",
  borderRadius: "20px",
  padding: "14px",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.12)",
  display: "grid",
  gap: "12px",
};

const dayDropZoneActiveStyle: React.CSSProperties = {
  border: "1px dashed rgba(0,212,255,0.55)",
  background: "rgba(0,212,255,0.06)",
};

const weekGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: "12px",
};

const weekGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const weekDayCardStyle: React.CSSProperties = {
  minHeight: "190px",
  borderRadius: "18px",
  padding: "12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.12)",
  display: "grid",
  alignContent: "start",
  gap: "10px",
};

const weekDayCardActiveStyle: React.CSSProperties = {
  border: "1px dashed rgba(0,212,255,0.55)",
  background: "rgba(0,212,255,0.06)",
};

const weekDayHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
};

const weekDayNameStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#8fdfff",
};

const weekDayDateStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
};

const weekJobsWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const weekJobPillStyle: React.CSSProperties = {
  borderRadius: "12px",
  padding: "10px",
  background: "rgba(0,212,255,0.12)",
  border: "1px solid rgba(0,212,255,0.18)",
  cursor: "grab",
};

const weekJobTimeStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#8fdfff",
  fontWeight: 700,
  marginBottom: "4px",
};

const weekJobCustomerStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: 1.3,
};

const monthGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: "10px",
};

const monthGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const monthCellStyle: React.CSSProperties = {
  minHeight: "120px",
  borderRadius: "16px",
  padding: "10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.12)",
  display: "grid",
  alignContent: "start",
  gap: "8px",
};

const monthCellActiveStyle: React.CSSProperties = {
  border: "1px dashed rgba(0,212,255,0.55)",
  background: "rgba(0,212,255,0.06)",
};

const monthCellMutedStyle: React.CSSProperties = {
  opacity: 0.52,
};

const monthCellDateStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#8fdfff",
};

const monthCellJobsStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const monthJobChipStyle: React.CSSProperties = {
  borderRadius: "10px",
  padding: "8px",
  background: "rgba(0,212,255,0.12)",
  border: "1px solid rgba(0,212,255,0.18)",
  fontSize: "11px",
  lineHeight: 1.25,
  cursor: "grab",
};

const listWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const scheduleCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const scheduleTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const scheduleIdStyle: React.CSSProperties = {
  color: "#8fdfff",
  fontSize: "14px",
  fontWeight: 700,
  wordBreak: "break-all",
};

const scheduleTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginBottom: "8px",
};

const scheduleMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  marginBottom: "16px",
};

const detailsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const infoBoxStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.4,
};

const calendarJobCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "grab",
};

const calendarJobTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "10px",
  flexWrap: "wrap",
};

const calendarJobTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: 1.2,
};

const calendarJobMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  marginBottom: "10px",
  fontSize: "14px",
};

const calendarJobBottomStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  fontSize: "13px",
  color: "rgba(216,238,255,0.66)",
};

const emptyCalendarStyle: React.CSSProperties = {
  borderRadius: "16px",
  padding: "18px",
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.1)",
  color: "rgba(231,243,255,0.66)",
  textAlign: "center",
};

const emptySmallStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(231,243,255,0.46)",
};

const emptyTinyStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "rgba(231,243,255,0.34)",
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "capitalize",
  whiteSpace: "nowrap",
};

const scheduledBadgeStyle: React.CSSProperties = {
  color: "#bfe8ff",
  background: "rgba(0, 198, 255, 0.12)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
};

const confirmedBadgeStyle: React.CSSProperties = {
  color: "#bfffd6",
  background: "rgba(52, 199, 89, 0.12)",
  border: "1px solid rgba(52, 199, 89, 0.22)",
};

const followUpBadgeStyle: React.CSSProperties = {
  color: "#ffe9b3",
  background: "rgba(255, 191, 0, 0.12)",
  border: "1px solid rgba(255, 191, 0, 0.22)",
};
