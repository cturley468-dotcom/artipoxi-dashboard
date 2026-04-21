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

type Invoice = {
  id: string;
  created_at: string;
  invoice_number: string;
  customer_name: string;
  status: "draft" | "sent" | "paid" | "overdue";
  total: number;
  due_date: string | null;
  job_id: string | null;
};

type Expense = {
  id: string;
  created_at: string;
  vendor: string;
  category: string;
  amount: number;
  notes: string | null;
};

type Receipt = {
  id: string;
  created_at: string;
  title: string;
  amount: number;
  source: string | null;
  notes: string | null;
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

const demoInvoices: Invoice[] = [
  {
    id: "INV-1001",
    created_at: "2026-04-08T09:00:00Z",
    invoice_number: "AP-1001",
    customer_name: "Smith Residence",
    status: "sent",
    total: 4800,
    due_date: "2026-04-20",
    job_id: "JOB-1001",
  },
  {
    id: "INV-1002",
    created_at: "2026-04-10T15:00:00Z",
    invoice_number: "AP-1002",
    customer_name: "Harris Auto",
    status: "paid",
    total: 9200,
    due_date: "2026-04-18",
    job_id: "JOB-1002",
  },
  {
    id: "INV-1003",
    created_at: "2026-04-11T13:00:00Z",
    invoice_number: "AP-1003",
    customer_name: "Turner Property",
    status: "draft",
    total: 3500,
    due_date: "2026-04-24",
    job_id: "JOB-1003",
  },
];

const demoExpenses: Expense[] = [
  {
    id: "EXP-1001",
    created_at: "2026-04-09T08:00:00Z",
    vendor: "Sherwin-Williams",
    category: "Materials",
    amount: 1250,
    notes: "Primer + topcoat",
  },
  {
    id: "EXP-1002",
    created_at: "2026-04-10T12:30:00Z",
    vendor: "Home Depot",
    category: "Supplies",
    amount: 184,
    notes: "Rollers, tape, plastic",
  },
  {
    id: "EXP-1003",
    created_at: "2026-04-12T17:00:00Z",
    vendor: "Shell",
    category: "Fuel",
    amount: 96,
    notes: "Crew truck fuel",
  },
];

const demoReceipts: Receipt[] = [
  {
    id: "RCT-1001",
    created_at: "2026-04-12T18:00:00Z",
    title: "Deposit Received",
    amount: 2400,
    source: "Smith Residence",
    notes: "50% deposit",
  },
  {
    id: "RCT-1002",
    created_at: "2026-04-13T10:00:00Z",
    title: "Final Payment",
    amount: 9200,
    source: "Harris Auto",
    notes: "Paid in full",
  },
];

type FinanceTab = "overview" | "invoices" | "expenses" | "receipts";

export default function FinancePage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<FinanceTab>("overview");
  const [search, setSearch] = useState("");

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
    setMessage("");

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

    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("id, created_at, invoice_number, customer_name, status, total, due_date, job_id")
      .order("created_at", { ascending: false });

    if (invoicesError) {
      usedDemo = true;
      setInvoices(demoInvoices);
    } else {
      setInvoices((invoicesData as Invoice[]) || []);
    }

    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("id, created_at, vendor, category, amount, notes")
      .order("created_at", { ascending: false });

    if (expensesError) {
      usedDemo = true;
      setExpenses(demoExpenses);
    } else {
      setExpenses((expensesData as Expense[]) || []);
    }

    const { data: receiptsData, error: receiptsError } = await supabase
      .from("receipts")
      .select("id, created_at, title, amount, source, notes")
      .order("created_at", { ascending: false });

    if (receiptsError) {
      usedDemo = true;
      setReceipts(demoReceipts);
    } else {
      setReceipts((receiptsData as Receipt[]) || []);
    }

    if (usedDemo) {
      setMessage("Using demo finance data where live Supabase tables are not ready yet.");
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
        .filter((job) => {
          const status = (job.status ?? "").toLowerCase();
          return status === "complete" || status === "completed";
        })
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

  const totalInvoiceValue = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices]
  );

  const paidInvoiceValue = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices]
  );

  const unpaidInvoiceValue = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status !== "paid")
        .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const totalReceipts = useMemo(
    () => receipts.reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0),
    [receipts]
  );

  const netTrackedCash = useMemo(
    () => totalReceipts - totalExpenses,
    [totalReceipts, totalExpenses]
  );

  const openJobs = jobs.filter((j) => (j.status ?? "").toLowerCase() === "open").length;
  const scheduledJobs = jobs.filter((j) => (j.status ?? "").toLowerCase() === "scheduled").length;
  const completeJobs = jobs.filter((j) => {
    const status = (j.status ?? "").toLowerCase();
    return status === "complete" || status === "completed";
  }).length;
  const convertedQuotes = quotes.filter((q) => (q.status ?? "").toLowerCase() === "converted").length;

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;

    return invoices.filter((invoice) =>
      [
        invoice.id,
        invoice.invoice_number,
        invoice.customer_name,
        invoice.status,
        invoice.job_id,
        invoice.due_date,
        String(invoice.total),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [invoices, search]);

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((expense) =>
      [expense.id, expense.vendor, expense.category, expense.notes, String(expense.amount)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [expenses, search]);

  const filteredReceipts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return receipts;

    return receipts.filter((receipt) =>
      [receipt.id, receipt.title, receipt.source, receipt.notes, String(receipt.amount)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [receipts, search]);

  const recentTransactions = [...jobs]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const recentQuotes = [...quotes]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const recentExpenses = [...expenses]
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
            <Link href="/" className={styles.sideLink}>Home</Link>
            <Link href="/dashboard" className={styles.sideLink}>Dashboard</Link>
            <Link href="/dashboard/jobs" className={styles.sideLink}>Jobs</Link>
            <Link href="/dashboard/leads" className={styles.sideLink}>Leads</Link>
            <Link href="/dashboard/schedule" className={styles.sideLink}>Schedule</Link>
            <Link href="/dashboard/quotes" className={styles.sideLink}>Quotes</Link>
            <Link href="/configurator" className={styles.sideLink}>Configurator</Link>
            <Link href="/dashboard/finance" className={styles.sideLinkActive}>Finance</Link>
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
              <p className={styles.eyebrow}>FINANCE CENTER</p>
              <h1 className={styles.title}>Finance</h1>
              <p className={styles.subtitle}>
                Track invoices, expenses, receipts, completed revenue, and active pipeline from one place.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/dashboard/quotes" className={styles.primaryBtn}>Open Quotes</Link>
              <Link href="/dashboard/jobs" className={styles.secondaryBtn}>Open Jobs</Link>
            </div>
          </header>

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>Finance Snapshot</p>
              <h2 className={styles.heroTitle}>See what is billed, paid, spent, and still in pipeline.</h2>
              <p className={styles.heroText}>
                This page is now the base for your finance hub. Next step after this is wiring invoice creation directly from jobs.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Invoice Value</span>
                <strong className={styles.heroMiniValue}>${totalInvoiceValue.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Paid Invoices</span>
                <strong className={styles.heroMiniValue}>${paidInvoiceValue.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Expenses</span>
                <strong className={styles.heroMiniValue}>${totalExpenses.toLocaleString()}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Net Tracked Cash</span>
                <strong className={styles.heroMiniValue}>${netTrackedCash.toLocaleString()}</strong>
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

          <section className={styles.bottomGrid}>
            <div className={styles.panel}>
              <p className={styles.panelTag}>Finance Views</p>
              <h3 className={styles.panelTitle}>Switch sections</h3>

              <div className={styles.linkList}>
                <button className={styles.actionLink} onClick={() => setTab("overview")}>Overview</button>
                <button className={styles.actionLink} onClick={() => setTab("invoices")}>Invoices</button>
                <button className={styles.actionLink} onClick={() => setTab("expenses")}>Expenses</button>
                <button className={styles.actionLink} onClick={() => setTab("receipts")}>Receipts</button>
              </div>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>Search</p>
              <h3 className={styles.panelTitle}>Find financial records</h3>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices, expenses, receipts"
                className={styles.searchInput}
              />
            </div>
          </section>

          {tab === "overview" && (
            <>
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
                        <div className={styles.listValue}>${Number(job.price || 0).toLocaleString()}</div>
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
                        <div className={styles.listValue}>${Number(quote.total_estimate || 0).toLocaleString()}</div>
                      </div>
                    ))}

                    {!recentQuotes.length ? (
                      <p className={styles.emptyText}>No quotes yet.</p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className={styles.contentGrid}>
                <div className={styles.panel}>
                  <p className={styles.panelTag}>Recent Invoices</p>
                  <h3 className={styles.panelTitle}>Billing activity</h3>

                  <div className={styles.list}>
                    {recentInvoices.map((invoice) => (
                      <div key={invoice.id} className={styles.listRow}>
                        <div>
                          <div className={styles.listTitle}>{invoice.invoice_number}</div>
                          <div className={styles.listMeta}>
                            {invoice.customer_name} • {invoice.status.toUpperCase()}
                          </div>
                        </div>
                        <div className={styles.listValue}>${Number(invoice.total || 0).toLocaleString()}</div>
                      </div>
                    ))}

                    {!recentInvoices.length ? (
                      <p className={styles.emptyText}>No invoices yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className={styles.panel}>
                  <p className={styles.panelTag}>Recent Expenses</p>
                  <h3 className={styles.panelTitle}>Outgoing money</h3>

                  <div className={styles.list}>
                    {recentExpenses.map((expense) => (
                      <div key={expense.id} className={styles.listRow}>
                        <div>
                          <div className={styles.listTitle}>{expense.vendor}</div>
                          <div className={styles.listMeta}>
                            {expense.category} • {formatDate(expense.created_at)}
                          </div>
                        </div>
                        <div className={styles.listValue}>-${Number(expense.amount || 0).toLocaleString()}</div>
                      </div>
                    ))}

                    {!recentExpenses.length ? (
                      <p className={styles.emptyText}>No expenses yet.</p>
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
                      <span>Unpaid Invoices</span>
                      <strong>${unpaidInvoiceValue.toLocaleString()}</strong>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Total Expenses</span>
                      <strong>${totalExpenses.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.panel}>
                  <p className={styles.panelTag}>Quick Actions</p>
                  <h3 className={styles.panelTitle}>Move faster</h3>

                  <div className={styles.linkList}>
                    <Link href="/dashboard/quotes" className={styles.actionLink}>View Saved Quotes</Link>
                    <Link href="/dashboard/jobs" className={styles.actionLink}>Review Jobs</Link>
                    <Link href="/configurator" className={styles.actionLink}>Create New Quote</Link>
                    <Link href="/dashboard/schedule" className={styles.actionLink}>Check Schedule</Link>
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === "invoices" && (
            <section className={styles.panel}>
              <p className={styles.panelTag}>Invoices</p>
              <h3 className={styles.panelTitle}>Billing records</h3>

              <div className={styles.list}>
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listTitle}>
                        {invoice.invoice_number} • {invoice.customer_name}
                      </div>
                      <div className={styles.listMeta}>
                        {invoice.status.toUpperCase()} • Due {invoice.due_date || "No due date"}
                      </div>
                    </div>
                    <div className={styles.listValue}>${invoice.total.toLocaleString()}</div>
                  </div>
                ))}

                {!filteredInvoices.length ? (
                  <p className={styles.emptyText}>No invoices found.</p>
                ) : null}
              </div>
            </section>
          )}

          {tab === "expenses" && (
            <section className={styles.panel}>
              <p className={styles.panelTag}>Expenses</p>
              <h3 className={styles.panelTitle}>Cost records</h3>

              <div className={styles.list}>
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listTitle}>{expense.vendor}</div>
                      <div className={styles.listMeta}>
                        {expense.category} • {expense.notes || "No notes"}
                      </div>
                    </div>
                    <div className={styles.listValue}>-${expense.amount.toLocaleString()}</div>
                  </div>
                ))}

                {!filteredExpenses.length ? (
                  <p className={styles.emptyText}>No expenses found.</p>
                ) : null}
              </div>
            </section>
          )}

          {tab === "receipts" && (
            <section className={styles.panel}>
              <p className={styles.panelTag}>Receipts</p>
              <h3 className={styles.panelTitle}>Incoming money records</h3>

              <div className={styles.list}>
                {filteredReceipts.map((receipt) => (
                  <div key={receipt.id} className={styles.listRow}>
                    <div>
                      <div className={styles.listTitle}>{receipt.title}</div>
                      <div className={styles.listMeta}>
                        {receipt.source || "Unknown source"} • {receipt.notes || "No notes"}
                      </div>
                    </div>
                    <div className={styles.listValue}>${receipt.amount.toLocaleString()}</div>
                  </div>
                ))}

                {!filteredReceipts.length ? (
                  <p className={styles.emptyText}>No receipts found.</p>
                ) : null}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
