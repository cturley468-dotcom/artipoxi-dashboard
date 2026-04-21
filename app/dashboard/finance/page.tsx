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
  customer: string | null;
  status: string | null;
  value: number | null;
};

type Invoice = {
  id: string;
  job_id: string;
  invoice_number: string | null;
  status: string | null;
  issue_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  amount_paid: number | null;
  balance_due: number | null;
  notes: string | null;
  created_at: string;
};

type InvoicePayment = {
  id: string;
  invoice_id: string;
  payment_date: string | null;
  amount: number | null;
  method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
};

type FinancialEntry = {
  id: string;
  job_id: string | null;
  invoice_id: string | null;
  entry_type: string | null;
  category: string | null;
  description: string | null;
  amount: number | null;
  entry_date: string | null;
  receipt_url: string | null;
  created_at: string;
};

export default function FinancePage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);

  const [message, setMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);

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
    setLoadingData(true);
    setMessage("");

    const [jobsRes, invoicesRes, paymentsRes, entriesRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, created_at, customer, status, value")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoice_payments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("financial_entries")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (jobsRes.error) {
      console.error("Jobs finance load error:", jobsRes.error);
      setJobs([]);
    } else {
      setJobs((jobsRes.data as Job[]) || []);
    }

    if (invoicesRes.error) {
      console.error("Invoices finance load error:", invoicesRes.error);
      setInvoices([]);
      setMessage("Finance page loaded, but invoices could not be read yet.");
    } else {
      setInvoices((invoicesRes.data as Invoice[]) || []);
    }

    if (paymentsRes.error) {
      console.error("Payments finance load error:", paymentsRes.error);
      setPayments([]);
    } else {
      setPayments((paymentsRes.data as InvoicePayment[]) || []);
    }

    if (entriesRes.error) {
      console.error("Entries finance load error:", entriesRes.error);
      setEntries([]);
    } else {
      setEntries((entriesRes.data as FinancialEntry[]) || []);
    }

    setLoadingData(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const totalJobRevenue = useMemo(() => {
    return jobs.reduce((sum, job) => sum + Number(job.value || 0), 0);
  }, [jobs]);

  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce(
      (sum, invoice) => sum + Number(invoice.balance_due || 0),
      0
    );
  }, [invoices]);

  const totalExpenses = useMemo(() => {
    return entries
      .filter((entry) => (entry.entry_type || "").toLowerCase() === "expense")
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }, [entries]);

  const netTracked = useMemo(() => {
    return totalCollected - totalExpenses;
  }, [totalCollected, totalExpenses]);

  const draftInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) => (invoice.status || "").toLowerCase() === "draft"
    ).length;
  }, [invoices]);

  const sentInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) => (invoice.status || "").toLowerCase() === "sent"
    ).length;
  }, [invoices]);

  const paidInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) => (invoice.status || "").toLowerCase() === "paid"
    ).length;
  }, [invoices]);

  const overdueInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const status = (invoice.status || "").toLowerCase();
      if (status === "paid") return false;
      if (!invoice.due_date) return false;

      const due = new Date(invoice.due_date);
      const today = new Date();

      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return due < today;
    }).length;
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices].slice(0, 6);
  }, [invoices]);

  const recentPayments = useMemo(() => {
    return [...payments].slice(0, 6);
  }, [payments]);

  const recentExpenses = useMemo(() => {
    return entries
      .filter((entry) => (entry.entry_type || "").toLowerCase() === "expense")
      .slice(0, 6);
  }, [entries]);

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
            {profile?.email ? (
              <p className={styles.userEmail}>Signed in as {profile.email}</p>
            ) : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>REVENUE + INVOICES + EXPENSES</p>
              <h1 className={styles.title}>Finance</h1>
              <p className={styles.subtitle}>
                Track invoices, collected payments, expenses, and overall job value
                from one place.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/dashboard/jobs" className={styles.primaryBtn}>
                Open Jobs
              </Link>
              <Link href="/dashboard/quotes" className={styles.secondaryBtn}>
                Open Quotes
              </Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>Finance Snapshot</p>
              <h2 className={styles.heroTitle}>
                See what is invoiced, collected, outstanding, and spent.
              </h2>
              <p className={styles.heroText}>
                This is the operating money view for ArtiPoxi. Jobs feed invoice
                creation, invoices feed collections, and expenses round out the
                real picture.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Total Job Value</span>
                <strong className={styles.heroMiniValue}>
                  ${totalJobRevenue.toLocaleString()}
                </strong>
              </div>

              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Total Invoiced</span>
                <strong className={styles.heroMiniValue}>
                  ${totalInvoiced.toLocaleString()}
                </strong>
              </div>

              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Collected</span>
                <strong className={styles.heroMiniValue}>
                  ${totalCollected.toLocaleString()}
                </strong>
              </div>

              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Outstanding</span>
                <strong className={styles.heroMiniValue}>
                  ${totalOutstanding.toLocaleString()}
                </strong>
              </div>
            </div>
          </section>

          {message ? <p className={styles.message}>{message}</p> : null}

          {loadingData ? (
            <div className={styles.panel} style={{ marginTop: "20px" }}>
              Loading finance data...
            </div>
          ) : (
            <>
              <section className={styles.statsGrid}>
                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Draft Invoices</span>
                  <strong className={styles.statValue}>{draftInvoices}</strong>
                  <span className={styles.statDetail}>Not sent yet</span>
                </article>

                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Sent Invoices</span>
                  <strong className={styles.statValue}>{sentInvoices}</strong>
                  <span className={styles.statDetail}>Waiting for payment</span>
                </article>

                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Paid Invoices</span>
                  <strong className={styles.statValue}>{paidInvoices}</strong>
                  <span className={styles.statDetail}>Closed billing</span>
                </article>

                <article className={styles.statCard}>
                  <span className={styles.statLabel}>Overdue</span>
                  <strong className={styles.statValue}>{overdueInvoices}</strong>
                  <span className={styles.statDetail}>Needs follow-up</span>
                </article>
              </section>

              <section className={styles.contentGrid}>
                <div className={styles.panel}>
                  <p className={styles.panelTag}>Recent Invoices</p>
                  <h3 className={styles.panelTitle}>Latest billing activity</h3>

                  <div className={styles.list}>
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map((invoice) => (
                        <div key={invoice.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listTitle}>
                              {invoice.invoice_number || "Invoice"}
                            </div>
                            <div className={styles.listMeta}>
                              Job: {invoice.job_id} •{" "}
                              {(invoice.status || "draft").toUpperCase()}
                            </div>
                          </div>
                          <div className={styles.listValue}>
                            ${Number(invoice.total || 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyText}>No invoices yet.</p>
                    )}
                  </div>
                </div>

                <div className={styles.panel}>
                  <p className={styles.panelTag}>Recent Payments</p>
                  <h3 className={styles.panelTitle}>Money received</h3>

                  <div className={styles.list}>
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment) => (
                        <div key={payment.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listTitle}>
                              {payment.method || "Payment"}
                            </div>
                            <div className={styles.listMeta}>
                              Invoice: {payment.invoice_id} •{" "}
                              {formatDate(payment.payment_date)}
                            </div>
                          </div>
                          <div className={styles.listValue}>
                            ${Number(payment.amount || 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyText}>No payments recorded yet.</p>
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.bottomGrid}>
                <div className={styles.panel}>
                  <p className={styles.panelTag}>Recent Expenses</p>
                  <h3 className={styles.panelTitle}>Costs and receipts</h3>

                  <div className={styles.list}>
                    {recentExpenses.length > 0 ? (
                      recentExpenses.map((entry) => (
                        <div key={entry.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listTitle}>
                              {entry.category || "Expense"}
                            </div>
                            <div className={styles.listMeta}>
                              {entry.description || "No description"} •{" "}
                              {formatDate(entry.entry_date)}
                            </div>
                          </div>
                          <div className={styles.listValue}>
                            ${Number(entry.amount || 0).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyText}>No expenses recorded yet.</p>
                    )}
                  </div>
                </div>

                <div className={styles.panel}>
                  <p className={styles.panelTag}>Value Breakdown</p>
                  <h3 className={styles.panelTitle}>Tracked money picture</h3>

                  <div className={styles.breakdownList}>
                    <div className={styles.breakdownRow}>
                      <span>Total Job Value</span>
                      <strong>${totalJobRevenue.toLocaleString()}</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Total Invoiced</span>
                      <strong>${totalInvoiced.toLocaleString()}</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Total Collected</span>
                      <strong>${totalCollected.toLocaleString()}</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Total Expenses</span>
                      <strong>${totalExpenses.toLocaleString()}</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Net Tracked</span>
                      <strong>${netTracked.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.bottomGrid}>
                <div className={styles.panel}>
                  <p className={styles.panelTag}>Quick Actions</p>
                  <h3 className={styles.panelTitle}>Move faster</h3>

                  <div className={styles.linkList}>
                    <Link href="/dashboard/jobs" className={styles.actionLink}>
                      Open Jobs
                    </Link>
                    <Link href="/dashboard/schedule" className={styles.actionLink}>
                      Open Schedule
                    </Link>
                    <Link href="/dashboard/inventory" className={styles.actionLink}>
                      Open Inventory
                    </Link>
                    <Link href="/dashboard/quotes" className={styles.actionLink}>
                      Open Quotes
                    </Link>
                  </div>
                </div>

                <div className={styles.panel}>
                  <p className={styles.panelTag}>Foundation Status</p>
                  <h3 className={styles.panelTitle}>What is live now</h3>

                  <div className={styles.breakdownList}>
                    <div className={styles.breakdownRow}>
                      <span>Jobs table feeding finance</span>
                      <strong>Live</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Invoice records</span>
                      <strong>Live</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Payment tracking</span>
                      <strong>Live</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Expense ledger</span>
                      <strong>Live</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Printable invoice PDF</span>
                      <strong>Next</strong>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
