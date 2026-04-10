"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  status: string | null;
  notes: string | null;
};

export default function InstallerSchedulePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const installerProfile = await getCurrentProfile();

      if (!mounted) return;

      if (!installerProfile) {
        router.replace("/login");
        return;
      }

      if (!isInstaller(installerProfile.role)) {
        router.replace("/dashboard");
        return;
      }

      setProfile(installerProfile);
      setCheckingAuth(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    async function fetchAssignments() {
      const { data, error } = await supabase
        .from("schedule_assignments")
        .select("*")
        .order("assignment_date", { ascending: true });

      if (error) {
        console.error("Installer schedule fetch error:", error.message);
        return;
      }

      setAssignments((data as ScheduleItem[]) || []);
    }

    fetchAssignments();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>Checking installer access...</div>
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
              <h2 className={styles.brandBottom}>Installer Hub</h2>
            </div>
          </div>

          <nav className={styles.sideNav}>
            <Link href="/installer/work-orders" className={styles.sideLink}>
              Work Orders
            </Link>
            <Link href="/installer/schedule" className={styles.sideLinkActive}>
              Schedule
            </Link>
          </nav>

          <div className={styles.sideFooter}>
            {profile?.email ? <p className={styles.userEmail}>{profile.email}</p> : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>INSTALLER SCHEDULE</p>
              <h1 className={styles.title}>Assignments</h1>
              <p className={styles.subtitle}>
                View upcoming assignment times, locations, and crew scheduling.
              </p>
            </div>
          </header>

          <section className={styles.assignmentGrid}>
            {assignments.map((item) => (
              <article key={item.id} className={styles.assignmentCard}>
                <div className={styles.assignmentTop}>
                  <p className={styles.assignmentId}>{item.assignment_date}</p>
                  <span className={styles.assignmentCrew}>{item.crew ?? "—"}</span>
                </div>

                <h3 className={styles.assignmentTitle}>{item.title}</h3>

                <div className={styles.assignmentMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Client</span>
                    <span className={styles.metaValue}>{item.client_name ?? "—"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Time</span>
                    <span className={styles.metaValue}>{item.assignment_time ?? "—"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Location</span>
                    <span className={styles.metaValue}>{item.location ?? "—"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Status</span>
                    <span className={styles.metaValue}>{item.status ?? "—"}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
