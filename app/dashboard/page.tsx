import Link from "next/link";
import styles from "./page.module.css";

const statCards = [
  { label: "Projected Revenue", value: "$24,500" },
  { label: "Active Jobs", value: "8" },
  { label: "Open Leads", value: "13" },
  { label: "Work Orders", value: "21" },
];

const quickLinks = [
  { label: "Open Jobs", href: "/jobs" },
  { label: "Configurator", href: "/configurator" },
  { label: "Login", href: "/login" },
];

export default function DashboardPage() {
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
            <Link href="/dashboard" className={styles.sideLinkActive}>Dashboard</Link>
            <Link href="/jobs" className={styles.sideLink}>Jobs</Link>
            <Link href="/configurator" className={styles.sideLink}>Configurator</Link>
            <Link href="/login" className={styles.sideLink}>Login</Link>
          </nav>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>CONTROL CENTER</p>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>
                Track jobs, scheduling, leads, and business activity from one clean control center.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/jobs" className={styles.primaryBtn}>Open Jobs</Link>
              <Link href="/configurator" className={styles.secondaryBtn}>Configurator</Link>
            </div>
          </header>

          <section className={styles.statsGrid}>
            {statCards.map((item) => (
              <article key={item.label} className={styles.statCard}>
                <span className={styles.statLabel}>{item.label}</span>
                <strong className={styles.statValue}>{item.value}</strong>
              </article>
            ))}
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.panelLarge}>
              <p className={styles.panelTag}>Quick Actions</p>
              <h3 className={styles.panelTitle}>Run the business faster</h3>
              <p className={styles.panelText}>
                Jump into the most-used tools and keep the workflow moving.
              </p>

              <div className={styles.linkList}>
                {quickLinks.map((item) => (
                  <Link key={item.label} href={item.href} className={styles.actionLink}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>System Status</p>
              <h3 className={styles.panelTitle}>All systems ready</h3>

              <div className={styles.statusList}>
                <div className={styles.statusRow}>
                  <span>Dashboard</span>
                  <span className={styles.statusGood}>Active</span>
                </div>
                <div className={styles.statusRow}>
                  <span>Jobs</span>
                  <span className={styles.statusGood}>Ready</span>
                </div>
                <div className={styles.statusRow}>
                  <span>Schedule</span>
                  <span className={styles.statusGood}>Ready</span>
                </div>
                <div className={styles.statusRow}>
                  <span>Configurator</span>
                  <span className={styles.statusGood}>Ready</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className={styles.panel}>
              <p className={styles.panelTag}>Lead Summary</p>
              <h3 className={styles.panelTitle}>13 open leads</h3>
              <p className={styles.panelText}>
                Continue building real lead cards, pipeline movement, and customer notes here.
              </p>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>Scheduling</p>
              <h3 className={styles.panelTitle}>Upcoming installs</h3>
              <p className={styles.panelText}>
                This section can become your live install board, schedule calendar, or crew view.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
