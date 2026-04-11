"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../lib/auth";
import styles from "./page.module.css";

const stats = [
  { label: "Projected Revenue", value: "$24,500", detail: "+12% this month" },
  { label: "Active Jobs", value: "8", detail: "3 installs this week" },
  { label: "Open Leads", value: "13", detail: "5 need follow-up" },
  { label: "Work Orders", value: "21", detail: "7 ready to schedule" },
];

const pipeline = [
  { stage: "New Leads", count: "5" },
  { stage: "Quoted", count: "4" },
  { stage: "Scheduled", count: "3" },
  { stage: "In Progress", count: "4" },
];

const recentActivity = [
  { title: "Smith Garage moved to Scheduled", time: "10 min ago" },
  { title: "Harris Shop estimate updated", time: "42 min ago" },
  { title: "Turner Patio deposit marked paid", time: "1 hr ago" },
  { title: "New lead added from website form", time: "2 hr ago" },
];

const upcoming = [
  { title: "Garage Epoxy Install", date: "Apr 14", location: "Anderson, SC" },
  { title: "Shop Floor Coating", date: "Apr 16", location: "Greenville, SC" },
  { title: "Patio Seal + Finish", date: "Apr 19", location: "Belton, SC" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

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
        router.replace("/installer/work-orders");
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (checkingAuth) {
    return (
      <main className="themePage bg-dashboard">
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>
            <p className={styles.loadingText}>Checking session...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="themePage bg-dashboard">
      <div className="themeShell">
        <aside className="themeSidebar">
          <div className="themeBrand">
            <div className="themeLogo">AP</div>
            <div>
              <p className="themeBrandTop">ARTIPOXI</p>
              <h2 className="themeBrandBottom">Operations</h2>
            </div>
          </div>

          <nav className="themeNav">
            <Link href="/" className="themeLink">
              Home
            </Link>
            <Link href="/dashboard" className="themeLinkActive">
              Dashboard
            </Link>
            <Link href="/dashboard/jobs" className="themeLink">
              Jobs
            </Link>
            <Link href="/dashboard/leads" className="themeLink">
              Leads
            </Link>
            <Link href="/dashboard/schedule" className="themeLink">
              Schedule
            </Link>
            <Link href="/dashboard/quotes" className="themeLink">
              Quotes
            </Link>
            <Link href="/configurator" className="themeLink">
              Configurator
            </Link>
            <Link href="/dashboard/finance" className="themeLink">
              Finance
            </Link>
            <Link href="/dashboard/inventory" className="themeLink">
              Inventory
            </Link>
          </nav>

          <div className="themeSidebarFooter">
            {profile?.email ? (
              <p className="themeUserEmail">Signed in as {profile.email}</p>
            ) : null}
            <button className="themeButtonGhost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className="themeMain">
          <header className="themeTopbar">
            <div>
              <p className="themeEyebrow">CONTROL CENTER</p>
              <h1 className="themeTitle">Dashboard</h1>
              <p className="themeSubtitle">
                Track jobs, scheduling, leads, and business activity from one clean control center.
              </p>
            </div>

            <div className="themeTopActions">
              <Link href="/dashboard/jobs" className="themeButton">
                Open Jobs
              </Link>
              <Link href="/configurator" className="themeButtonGhost">
                Configurator
              </Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div className="themeCard">
              <p className="themePanelTag">Business Snapshot</p>
              <h2 className={styles.heroTitle}>Everything important, one view.</h2>
              <p className={styles.heroText}>
                Keep your sales pipeline, install schedule, revenue targets, and active work moving in one place.
              </p>

              <div className={styles.heroActions}>
                <Link href="/dashboard/leads" className="themeButton">
                  View Leads
                </Link>
                <Link href="/dashboard/schedule" className="themeButtonGhost">
                  Open Schedule
                </Link>
              </div>
            </div>

            <div className={styles.heroMiniGrid}>
              <div className="themeCard">
                <span className={styles.heroMiniLabel}>Focus</span>
                <strong className={styles.heroMiniValue}>3 installs this week</strong>
              </div>
              <div className="themeCard">
                <span className={styles.heroMiniLabel}>Next target</span>
                <strong className={styles.heroMiniValue}>Close 5 open leads</strong>
              </div>
            </div>
          </section>

          <section className={styles.statsGrid}>
            {stats.map((item) => (
              <article key={item.label} className="themeCard">
                <span className={styles.statLabel}>{item.label}</span>
                <strong className={styles.statValue}>{item.value}</strong>
                <span className={styles.statDetail}>{item.detail}</span>
              </article>
            ))}
          </section>

          <section className={styles.contentGrid}>
            <div className="themeCard">
              <p className="themePanelTag">Quick Actions</p>
              <h3 className="themePanelTitle">Run the business faster</h3>
              <p className="themePanelText">
                Jump into the most-used tools and keep the workflow moving.
              </p>

              <div className={styles.linkList}>
                <Link href="/dashboard/jobs" className={styles.actionLink}>
                  Open Jobs
                </Link>
                <Link href="/dashboard/leads" className={styles.actionLink}>
                  View Leads
                </Link>
                <Link href="/dashboard/schedule" className={styles.actionLink}>
                  Open Schedule
                </Link>
                <Link href="/dashboard/quotes" className={styles.actionLink}>
                  Saved Quotes
                </Link>
              </div>
            </div>

            <div className="themeCard">
              <p className="themePanelTag">Pipeline</p>
              <h3 className="themePanelTitle">Sales flow</h3>

              <div className={styles.pipelineList}>
                {pipeline.map((item) => (
                  <div key={item.stage} className={styles.pipelineRow}>
                    <span>{item.stage}</span>
                    <span className={styles.pipelineCount}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className="themeCard">
              <p className="themePanelTag">Upcoming Schedule</p>
              <h3 className="themePanelTitle">Next assignments</h3>

              <div className={styles.scheduleList}>
                {upcoming.map((item) => (
                  <div key={`${item.title}-${item.date}`} className={styles.scheduleRow}>
                    <div>
                      <div className={styles.scheduleTitle}>{item.title}</div>
                      <div className={styles.scheduleMeta}>{item.location}</div>
                    </div>
                    <div className={styles.scheduleDate}>{item.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="themeCard">
              <p className="themePanelTag">Recent Activity</p>
              <h3 className="themePanelTitle">Latest updates</h3>

              <div className={styles.activityList}>
                {recentActivity.map((item) => (
                  <div key={`${item.title}-${item.time}`} className={styles.activityRow}>
                    <div className={styles.activityDot} />
                    <div>
                      <div className={styles.activityTitle}>{item.title}</div>
                      <div className={styles.activityTime}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
