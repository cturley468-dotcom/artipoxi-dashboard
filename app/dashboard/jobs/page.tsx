"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type Job = {
  id: string;
  created_at: string;
  quote_id: string | null;
  title: string;
  client_name: string | null;
  client_email?: string | null;
  status: string | null;
  price: number | null;
  notes: string | null;
};

export default function JobsPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!checkingAuth) {
      void fetchJobs();
    }
  }, [checkingAuth]);

  async function fetchJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setJobs((data as Job[]) || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function updateJobStatus(id: string, status: string) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setWorkingId(null);
    await fetchJobs();
  }

  async function handleDeleteJob(id: string) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setMessage("Job deleted.");
    setWorkingId(null);
    await fetchJobs();
  }

  const filteredJobs = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return jobs;

    return jobs.filter((job) =>
      [
        job.title,
        job.client_name ?? "",
        job.client_email ?? "",
        job.status ?? "",
        job.notes ?? "",
        job.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [jobs, search]);

  const totalOpenValue = filteredJobs
    .filter((job) => (job.status ?? "").toLowerCase() !== "complete")
    .reduce((sum, job) => sum + Number(job.price || 0), 0);

  const openCount = filteredJobs.filter(
    (job) => (job.status ?? "").toLowerCase() === "open"
  ).length;

  const scheduledCount = filteredJobs.filter(
    (job) => (job.status ?? "").toLowerCase() === "scheduled"
  ).length;

  const inProgressCount = filteredJobs.filter(
    (job) => (job.status ?? "").toLowerCase() === "in progress"
  ).length;

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>Checking session...</div>
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
            <Link href="/" className={styles.sideLink}>
              Home
            </Link>
            <Link href="/dashboard" className={styles.sideLink}>
              Dashboard
            </Link>
            <Link href="/dashboard/jobs" className={styles.sideLinkActive}>
              Jobs
            </Link>
            <Link href="/dashboard/leads" className={styles.sideLink}>
              Leads
            </Link>
            <Link href="/dashboard/schedule" className={styles.sideLink}>
              Schedule
            </Link>
            <Link href="/dashboard/quotes" className={styles.sideLink}>
              Quotes
            </Link>
            <Link href="/configurator" className={styles.sideLink}>
              Configurator
            </Link>
            <Link href="/dashboard/finance" className={styles.sideLink}>
              Finance
            </Link>
            <Link href="/dashboard/inventory" className={styles.sideLink}>
              Inventory
            </Link>
          </nav>

          <div className={styles.sideFooter}>
            {profile?.email ? <p className={styles.userEmail}>Signed in as {profile.email}</p> : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>PROJECT TRACKING</p>
              <h1 className={styles.title}>Jobs</h1>
              <p className={styles.subtitle}>
                Track saved jobs, update statuses, and move work from quote to production.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/configurator" className={styles.primaryBtn}>
                New Quote
              </Link>
              <Link href="/dashboard/quotes" className={styles.secondaryBtn}>
                Saved Quotes
              </Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>Jobs Snapshot</p>
              <h2 className={styles.heroTitle}>Keep production moving.</h2>
              <p className={styles.heroText}>
                View open jobs, update statuses, and manage the value of active work from one page.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Open</span>
                <strong className={styles.heroMiniValue}>{openCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Scheduled</span>
                <strong className={styles.heroMiniValue}>{scheduledCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>In Progress</span>
                <strong className={styles.heroMiniValue}>{inProgressCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Open Value</span>
                <strong className={styles.heroMiniValue}>
                  ${totalOpenValue.toLocaleString()}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search jobs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          {message ? <p className={styles.message}>{message}</p> : null}

          <section className={styles.jobGrid}>
            {filteredJobs.map((job) => (
              <article key={job.id} className={styles.jobCard}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.jobId}>Job ID: {job.id}</p>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                  </div>

                  <span className={styles.statusBadge}>
                    {job.status || "open"}
                  </span>
                </div>

                <div className={styles.infoGrid}>
                  <Info label="Client" value={job.client_name || "—"} />
                  <Info label="Email" value={job.client_email || "—"} />
                  <Info label="Created" value={new Date(job.created_at).toLocaleDateString("en-US")} />
                </div>

                <div className={styles.notesBlock}>
                  <p className={styles.notesLabel}>Notes</p>
                  <p className={styles.notesText}>{job.notes || "No notes added yet."}</p>
                </div>

                <div className={styles.totalRow}>
                  <span>Job Value</span>
                  <strong>${Number(job.price || 0).toLocaleString()}</strong>
                </div>

                <div className={styles.statusActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => updateJobStatus(job.id, "open")}
                    disabled={workingId === job.id}
                  >
                    Open
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => updateJobStatus(job.id, "scheduled")}
                    disabled={workingId === job.id}
                  >
                    Scheduled
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => updateJobStatus(job.id, "in progress")}
                    disabled={workingId === job.id}
                  >
                    In Progress
                  </button>

                  <button
                    className={styles.actionGhostBtn}
                    onClick={() => updateJobStatus(job.id, "complete")}
                    disabled={workingId === job.id}
                  >
                    Complete
                  </button>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteJob(job.id)}
                    disabled={workingId === job.id}
                  >
                    Delete Job
                  </button>
                </div>
              </article>
            ))}

            {!filteredJobs.length ? (
              <div className={styles.emptyCard}>
                <h3>No jobs yet</h3>
                <p>Convert a saved quote into a job and it will appear here.</p>
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  );
}
