import Link from "next/link";
import styles from "./page.module.css";

const jobs = [
  { id: "J-1042", customer: "Smith Garage", status: "In Progress", total: "$4,800" },
  { id: "J-1043", customer: "Harris Shop", status: "Quoted", total: "$6,250" },
  { id: "J-1044", customer: "Turner Floor", status: "Scheduled", total: "$3,900" },
  { id: "J-1045", customer: "Custom Build", status: "Lead", total: "$8,100" },
];

export default function JobsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>PROJECT TRACKING</p>
            <h1 className={styles.title}>Jobs</h1>
            <p className={styles.subtitle}>
              Manage active work, quotes, and scheduled installs in one matching workspace.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.secondaryBtn}>Dashboard</Link>
            <Link href="/configurator" className={styles.primaryBtn}>New Configuration</Link>
          </div>
        </header>

        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <span>Job ID</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
          </div>

          {jobs.map((job) => (
            <div key={job.id} className={styles.tableRow}>
              <span>{job.id}</span>
              <span>{job.customer}</span>
              <span className={styles.status}>{job.status}</span>
              <span>{job.total}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
