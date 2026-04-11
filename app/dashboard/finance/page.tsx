
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
  title: string;
  client_name: string | null;
  status: string | null;
  price: number | null;
};

type Quote = {
  id: string;
  created_at: string;
  project_name: string | null;
  customer_name: string | null;
  status: string | null;
  total_estimate: number | null;
};

const demoJobs: Job[] = [
  {
    id: "JOB-1001",
    created_at: "2026-04-01T10:00:00Z",
    title: "Garage Epoxy Install",
    client_name: "Smith Residence",
    status: "open",
    price: 4800,
  },
  {
    id: "JOB-1002",
    created_at: "2026-04-03T14:00:00Z",
    title: "Shop Floor Coating",
    client_name: "Harris Auto",
    status: "scheduled",
    price: 9200,
  },
  {
    id: "JOB-1003",
    created_at: "2026-04-04T09:30:00Z",
    title: "Patio Seal + Finish",
    client_name: "Turner Property",
    status: "complete",
    price: 3500,
  },
];

const demoQuotes: Quote[] = [
  {
    id: "Q-1001",
    created_at: "2026-04-05T11:00:00Z",
    project_name: "Metallic Garage Floor",
    customer_name: "Davis Home",
    status: "draft",
    total_estimate: 6100,
  },
  {
    id: "Q-1002",
    created_at: "2026-04-06T13:20:00Z",
    project_name: "Showroom Coating",
    customer_name: "Prime Auto",
    status: "converted",
    total_estimate: 12400,
  },
];

export default function FinancePage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [message, setMessage] = useState("");

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
      void fetchFinanceData();
    }
  }, [checkingAuth]);

  async function fetchFinanceData() {
    let usedDemo = false;

    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("id, created_at, title, client_name, status, price")
      .order("created_at", { ascending: false });

    if (jobsError) {
      usedDemo = true;
      setJobs(demoJobs);
    } else {
      setJobs((jobsData as Job[]) || []);
    }

    const { data: quotesData, error: quotesError } = await supabase
      .from("quotes")
      .select("id, created_at, project_name, customer_name, status, total_estimate")
      .order("created_at", { ascending: false });

    if (quotesError) {
      usedDemo = true;
      setQuotes(demoQuotes);
    } else {
      setQuotes((quotesData as Quote[]) || []);
    }

    if (usedDemo) {
      setMessage("Using demo finance data where live Supabase data is not available.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const totalJobRevenue = useMemo(
    () => jobs.reduce((sum, job) => sum + Number(job.price || 0), 0),
    [jobs]
  );

  const completedRevenue = useMemo(
    () =>
      jobs
        .filter((job) => (job.status ?? "").toLowerCase() === "complete")
        .reduce((sum, job) => sum + Number(job.price || 0), 0),
    [jobs]
  );

  const activePipelineValue = useMemo(
    () =>
      jobs
        .filter((job) => {
          const status = (job.status ?? "").toLowerCase();
          return status === "open" || status === "scheduled" || status === "in progress";
        })
        .reduce((sum, job) => sum + Number(job.price || 0), 0),
    [jobs]
  );

  const quotePipelineValue = useMemo(
    () => quotes.reduce((sum, quote) => sum + Number(quote.total_estimate || 0), 0),
    [quotes]
  );

  const openJobs = jobs.filter((j) => (j.status ?? "").toLowerCase() === "open").length;
  const scheduledJobs = jobs.filter((j) => (j.status ?? "").toLowerCase() === "scheduled").length;
  const completeJobs = jobs.filter((j) => (j.status ?? "").toLowerCase() === "complete").length;
  const convertedQuotes = quotes.filter((q) => (q.status ?? "").toLowerCase() === "converted").length;

  const recentTransactions = [...jobs]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const recentQuotes = [...quotes]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

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
            <Link href="/dashboard/jobs" className={styles.sideLink}>
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
            <Link href="/dashboard/finance" className={styles.sideLinkActive}>
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
              <p className={styles.eyebrow}>REVENUE + PIPELINE</p>
              <h1 className={styles.title}>Finance</h1>
              <p className={styles.subtitle}>
                Track completed revenue, active production value, and quote pipeline performance from one place.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/dashboard/quotes" className={styles.primaryBtn}>
                Open Quotes
              </Link>
              <Link href="/dashboard/jobs" className={styles.secondaryBtn}>
                Open Jobs
              </Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>Finance Snapshot</p>
              <h2 className={styles.heroTitle}>See what is closed, active, and still in pipeline.</h2>
              <p className={styles.heroText}>
                Use this page to watch cash flow trends, production value, and the sales volume still waiting to close.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Total Job Revenue</span>
                <strong className={styles.heroMiniValue}>${totalJobRevenue.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Completed Revenue</span>
                <strong className={styles.heroMiniValue}>${completedRevenue.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Active Job Value</span>
                <strong className={styles.heroMiniValue}>${activePipelineValue.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Quote Pipeline</span>
                <strong className={styles.heroMiniValue}>${quotePipelineValue.toLocaleString()}</strong>
              </div>
            </div>
          </section>

          {message ? <p className={styles.message}>{message}</p> : null}

          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <span className={styles.statLabel}>Open Jobs</span>
              <strong className={styles.statValue}>{openJobs}</strong>
              <span className={styles.statDetail}>Waiting for production movement</span>
            </article>

            <article className={styles.statCard}>
              <span className={styles.statLabel}>Scheduled Jobs</span>
              <strong className={styles.statValue}>{scheduledJobs}</strong>
              <span className={styles.statDetail}>Ready to hit the calendar</span>
            </article>

            <article className={styles.statCard}>
              <span className={styles.statLabel}>Completed Jobs</span>
              <strong className={styles.statValue}>{completeJobs}</strong>
              <span className={styles.statDetail}>Closed revenue work</span>
            </article>

            <article className={styles.statCard}>
              <span className={styles.statLabel}>Converted Quotes</span>
              <strong className={styles.statValue}>{convertedQuotes}</strong>
              <span className={styles.statDetail}>Moved from estimate to job</span>
            </article>
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.panel}>
              <p className={styles.panelTag}>Recent Job Values</p>
              <h3 className={styles.panelTitle}>Latest revenue items</h3>

              <div className={styles.list}>
                {recentTransactions.map((job) => (
                  <div key={job.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listTitle}>{job.title}</div>
                      <div className={styles.listMeta}>
                        {job.client_name || "No client"} • {(job.status || "open").toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.listValue}>
                      ${Number(job.price || 0).toLocaleString()}
                    </div>
                  </div>
                ))}

                {!recentTransactions.length ? (
                  <p className={styles.emptyText}>No job revenue items yet.</p>
                ) : null}
              </div>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>Recent Quotes</p>
              <h3 className={styles.panelTitle}>Estimate pipeline</h3>

              <div className={styles.list}>
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listTitle}>{quote.project_name || "Untitled Quote"}</div>
                      <div className={styles.listMeta}>
                        {quote.customer_name || "No customer"} • {(quote.status || "draft").toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.listValue}>
                      ${Number(quote.total_estimate || 0).toLocaleString()}
                    </div>
                  </div>
                ))}

                {!recentQuotes.length ? (
                  <p className={styles.emptyText}>No quotes yet.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className={styles.panel}>
              <p className={styles.panelTag}>Value Breakdown</p>
              <h3 className={styles.panelTitle}>Where the money sits</h3>

              <div className={styles.breakdownList}>
                <div className={styles.breakdownRow}>
                  <span>Completed Revenue</span>
                  <strong>${completedRevenue.toLocaleString()}</strong>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Active Job Value</span>
                  <strong>${activePipelineValue.toLocaleString()}</strong>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Quote Pipeline</span>
                  <strong>${quotePipelineValue.toLocaleString()}</strong>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Total Visible Value</span>
                  <strong>${(completedRevenue + activePipelineValue + quotePipelineValue).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>Quick Actions</p>
              <h3 className={styles.panelTitle}>Move faster</h3>

              <div className={styles.linkList}>
                <Link href="/dashboard/quotes" className={styles.actionLink}>
                  View Saved Quotes
                </Link>
                <Link href="/dashboard/jobs" className={styles.actionLink}>
                  Review Jobs
                </Link>
                <Link href="/configurator" className={styles.actionLink}>
                  Create New Quote
                </Link>
                <Link href="/dashboard/schedule" className={styles.actionLink}>
                  Check Schedule
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
