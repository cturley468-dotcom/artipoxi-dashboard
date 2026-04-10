"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type ScheduleItem = {
  id: string;
  title: string;
  client_name: string | null;
  location: string | null;
  crew: string | null;
  assignment_date: string;
  assignment_time: string | null;
  status: "Scheduled" | "In Progress" | "Complete" | string;
  notes: string | null;
};

export default function SchedulePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(2026, 3, 14)));

  useEffect(() => {
    let mounted = true;

    async function protectPage() {
      const currentProfile = await getCurrentProfile();

      if (!mounted) return;

      if (!currentProfile) {
        router.replace("/login");
        return;
      }

      if (isInstaller(currentProfile.role)) {
        router.replace("/installer/schedule");
        return;
      }

      setProfile(currentProfile);
      setCheckingAuth(false);
    }

    protectPage();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    async function fetchSchedule() {
      const { data, error } = await supabase
        .from("schedule_assignments")
        .select("*")
        .order("assignment_date", { ascending: true });

      if (error) {
        console.error("Schedule fetch error:", error.message);
        return;
      }

      setScheduleItems((data as ScheduleItem[]) || []);
    }

    fetchSchedule();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: string | null; dayNumber: number | null }> = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, dayNumber: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateString = formatDate(dateObj);
      cells.push({ date: dateString, dayNumber: day });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null, dayNumber: null });
    }

    return cells;
  }, [currentMonth]);

  const selectedItems = scheduleItems.filter((item) => item.assignment_date === selectedDate);

  const upcomingItems = [...scheduleItems]
    .sort((a, b) =>
      `${a.assignment_date} ${a.assignment_time ?? ""}`.localeCompare(
        `${b.assignment_date} ${b.assignment_time ?? ""}`
      )
    )
    .slice(0, 5);

  function goPrevMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>
            <p className={styles.loadingText}>Checking session...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandCard}>
            <div className={styles.logo}>AP</div>
            <div>
              <p className={styles.brandTop}>ARTIPOXI</p>
              <h2 className={styles.brandBottom}>Operations</h2>
            </div>
          </div>

          <nav className={styles.sideNav}>
            <Link href="/" className={styles.sideLink}>Home</Link>
            <Link href="/dashboard" className={styles.sideLink}>Dashboard</Link>
            <Link href="/jobs" className={styles.sideLink}>Jobs</Link>
            <Link href="/leads" className={styles.sideLink}>Leads</Link>
            <Link href="/schedule" className={styles.sideLinkActive}>Schedule</Link>
            <Link href="/configurator" className={styles.sideLink}>Configurator</Link>
            <Link href="/dashboard/finance" className={styles.sideLink}>Finance</Link>
            <Link href="/dashboard/inventory" className={styles.sideLink}>Inventory</Link>
          </nav>

          <div className={styles.sideFooter}>
            {profile?.email ? <p className={styles.userEmail}>Signed in as {profile.email}</p> : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>CALENDAR + INSTALL FLOW</p>
              <h1 className={styles.title}>Schedule</h1>
              <p className={styles.subtitle}>
                Manage upcoming installs, track crew assignments, and keep the production calendar organized.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/jobs" className={styles.primaryBtn}>Open Jobs</Link>
              <Link href="/installer/schedule" className={styles.secondaryBtn}>Installer View</Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>This Month</p>
              <h2 className={styles.heroTitle}>Production calendar at a glance</h2>
              <p className={styles.heroText}>
                See scheduled installs, crew distribution, and active production days without leaving the dashboard flow.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Scheduled</span>
                <strong className={styles.heroMiniValue}>
                  {scheduleItems.filter((x) => x.status === "Scheduled").length}
                </strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>In Progress</span>
                <strong className={styles.heroMiniValue}>
                  {scheduleItems.filter((x) => x.status === "In Progress").length}
                </strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Complete</span>
                <strong className={styles.heroMiniValue}>
                  {scheduleItems.filter((x) => x.status === "Complete").length}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.calendarPanel}>
              <div className={styles.calendarHeader}>
                <div>
                  <p className={styles.panelTag}>Calendar View</p>
                  <h3 className={styles.panelTitle}>{monthLabel}</h3>
                </div>

                <div className={styles.calendarNav}>
                  <button className={styles.navBtn} onClick={goPrevMonth}>Prev</button>
                  <button className={styles.navBtn} onClick={goNextMonth}>Next</button>
                </div>
              </div>

              <div className={styles.weekHeader}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className={styles.weekCell}>{day}</div>
                ))}
              </div>

              <div className={styles.calendarGrid}>
                {monthData.map((cell, index) => {
                  const dayItems = cell.date
                    ? scheduleItems.filter((item) => item.assignment_date === cell.date)
                    : [];

                  const isSelected = cell.date === selectedDate;

                  return (
                    <button
                      key={`${cell.date}-${index}`}
                      className={`${styles.dayCell} ${isSelected ? styles.dayCellActive : ""} ${!cell.date ? styles.dayCellEmpty : ""}`}
                      onClick={() => cell.date && setSelectedDate(cell.date)}
                      disabled={!cell.date}
                    >
                      {cell.dayNumber ? <span className={styles.dayNumber}>{cell.dayNumber}</span> : null}

                      <div className={styles.dayEvents}>
                        {dayItems.slice(0, 2).map((item) => (
                          <span key={item.id} className={styles.dayEventPill}>
                            {item.title}
                          </span>
                        ))}
                        {dayItems.length > 2 ? (
                          <span className={styles.moreEvents}>+{dayItems.length - 2} more</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.sidePanel}>
              <div className={styles.panel}>
                <p className={styles.panelTag}>Selected Day</p>
                <h3 className={styles.panelTitle}>{selectedDate}</h3>

                <div className={styles.assignmentList}>
                  {selectedItems.length ? (
                    selectedItems.map((item) => (
                      <div key={item.id} className={styles.assignmentRow}>
                        <div className={styles.assignmentTop}>
                          <div>
                            <div className={styles.assignmentTitle}>{item.title}</div>
                            <div className={styles.assignmentMeta}>{item.client_name ?? "No client"}</div>
                          </div>
                          <span className={styles.statusBadge}>{item.status}</span>
                        </div>

                        <div className={styles.assignmentInfo}>
                          <span>{item.assignment_time ?? "—"}</span>
                          <span>{item.location ?? "—"}</span>
                          <span>{item.crew ?? "—"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyText}>No assignments for this day.</p>
                  )}
                </div>
              </div>

              <div className={styles.panel}>
                <p className={styles.panelTag}>Upcoming</p>
                <h3 className={styles.panelTitle}>Next assignments</h3>

                <div className={styles.upcomingList}>
                  {upcomingItems.map((item) => (
                    <div key={item.id} className={styles.upcomingRow}>
                      <div>
                        <div className={styles.upcomingTitle}>{item.title}</div>
                        <div className={styles.upcomingMeta}>
                          {item.assignment_date} • {item.assignment_time ?? "—"}
                        </div>
                      </div>
                      <span className={styles.upcomingCrew}>{item.crew ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
