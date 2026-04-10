"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

const demoAssignments = [
  {
    id: "SCH-201",
    date: "2026-04-14",
    time: "8:00 AM",
    location: "Anderson, SC",
    title: "Garage Epoxy Install",
    crew: "Crew A",
  },
  {
    id: "SCH-202",
    date: "2026-04-16",
    time: "9:30 AM",
    location: "Greenville, SC",
    title: "Shop Floor Coating",
    crew: "Crew B",
  },
  {
    id: "SCH-203",
    date: "2026-04-19",
    time: "10:00 AM",
    location: "Belton, SC",
    title: "Patio Seal + Finish",
    crew: "Crew A",
  },
];

export default function InstallerSchedulePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

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
            {demoAssignments.map((item) => (
              <article key={item.id} className={styles.assignmentCard}>
                <div className={styles.assignmentTop}>
                  <p className={styles.assignmentId}>{item.id}</p>
                  <span className={styles.assignmentCrew}>{item.crew}</span>
                </div>

                <h3 className={styles.assignmentTitle}>{item.title}</h3>

                <div className={styles.assignmentMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>{item.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Time</span>
                    <span className={styles.metaValue}>{item.time}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Location</span>
                    <span className={styles.metaValue}>{item.location}</span>
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
