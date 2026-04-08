"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  quotedprice?: number | null;
};

type FinancialEntry = {
  id: string;
  entry_type: "expense" | "income" | "invoice" | "payment";
  category: string | null;
  title: string;
  description: string | null;
  amount: number;
  job_id: string | null;
  vendor: string | null;
  receipt_url: string | null;
  entry_date: string;
  created_at: string;
};

type MonthlyBucket = {
  key: string;
  label: string;
  income: number;
  expenses: number;
  invoices: number;
  payments: number;
};

type JobProfitRow = {
  jobId: string;
  jobName: string;
  customer: string;
  quotedRevenue: number;
  trackedIncome: number;
  trackedExpenses: number;
  invoiceTotal: number;
  paymentTotal: number;
  estimatedProfit: number;
};

export default function FinancePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");

  const [entryType, setEntryType] =
    useState<FinancialEntry["entry_type"]>("expense");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [jobId, setJobId] = useState("");
  const [vendor, setVendor] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [entryDate, setEntryDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        const [entriesRes, jobsRes] = await Promise.all([
          supabase
            .from("financial_entries")
            .select("*")
            .order("entry_date", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("jobs")
            .select("id, name, customer, quotedprice")
            .order("created_at", { ascending: false }),
        ]);

        if (entriesRes.error) throw entriesRes.error;
        if (jobsRes.error) throw jobsRes.error;

        setEntries((entriesRes.data as FinancialEntry[]) || []);
        setJobs((jobsRes.data as Job[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load finance hub.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const metrics = useMemo(() => {
    const expenses = entries
      .filter((e) => e.entry_type === "expense")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const income = entries
      .filter((e) => e.entry_type === "income" || e.entry_type === "payment")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const invoices = entries
      .filter((e) => e.entry_type === "invoice")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const payments = entries
      .filter((e) => e.entry_type === "payment")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const profit = income - expenses;

    return {
      expenses,
      income,
      invoices,
      payments,
      profit,
    };
  }, [entries]);

  const monthlySummary = useMemo(() => {
    const buckets = new Map<string, MonthlyBucket>();

    for (const entry of entries) {
      const date = new Date(entry.entry_date);
      if (Number.isNaN(date.getTime())) continue;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });

      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          label,
          income: 0,
          expenses: 0,
          invoices: 0,
          payments: 0,
        });
      }

      const bucket = buckets.get(key)!;
      const amount = Number(entry.amount || 0);

      if (entry.entry_type === "expense") bucket.expenses += amount;
      if (entry.entry_type === "income") bucket.income += amount;
      if (entry.entry_type === "invoice") bucket.invoices += amount;
      if (entry.entry_type === "payment") {
        bucket.payments += amount;
        bucket.income += amount;
      }
    }

    return Array.from(buckets.values())
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 6);
  }, [entries]);

  const jobProfitability = useMemo(() => {
    const rows: JobProfitRow[] = jobs.map((job) => {
      const related = entries.filter((e) => e.job_id === job.id);

      const trackedIncome = related
        .filter((e) => e.entry_type === "income")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const trackedExpenses = related
        .filter((e) => e.entry_type === "expense")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const invoiceTotal = related
        .filter((e) => e.entry_type === "invoice")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const paymentTotal = related
        .filter((e) => e.entry_type === "payment")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const quotedRevenue = Number(job.quotedprice || 0);
      const revenueBasis =
        trackedIncome > 0 ? trackedIncome : paymentTotal > 0 ? paymentTotal : quotedRevenue;

      return {
        jobId: job.id,
        jobName: job.name || "Untitled Job",
        customer: job.customer || "No customer",
        quotedRevenue,
        trackedIncome,
        trackedExpenses,
        invoiceTotal,
        paymentTotal,
        estimatedProfit: revenueBasis - trackedExpenses,
      };
    });

    return rows
      .filter(
        (row) =>
          row.quotedRevenue > 0 ||
          row.trackedIncome > 0 ||
          row.trackedExpenses > 0 ||
          row.invoiceTotal > 0 ||
          row.paymentTotal > 0
      )
      .sort((a, b) => b.estimatedProfit - a.estimatedProfit);
  }, [entries, jobs]);

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !amount) {
      setMessage("Please enter at least a title and amount.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const profile = await getCurrentProfile();
      if (!profile || profile.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("financial_entries")
        .insert({
          entry_type: entryType,
          category: category || null,
          title: title.trim(),
          description: description || null,
          amount: Number(amount),
          job_id: jobId || null,
          vendor: vendor || null,
          receipt_url: receiptUrl || null,
          entry_date: entryDate,
          created_by: profile.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      setEntries((prev) => [data as FinancialEntry, ...prev]);

      setEntryType("expense");
      setCategory("");
      setTitle("");
      setDescription("");
      setAmount("");
      setJobId("");
      setVendor("");
      setReceiptUrl("");
      setEntryDate(new Date().toISOString().slice(0, 10));
      setMessage("Financial entry added.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to save financial entry.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading finance hub...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="glass-panel-soft rounded-[28px] p-5 md:p-6">
          <div className="section-kicker">Owner Finance Hub</div>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Financial Control Center
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Track expenses, invoices, payments, monthly activity, and job-level
                profitability in one private admin-only space.
              </p>
            </div>

            <div className="ui-chip ui-chip-lime">Admin Only</div>
          </div>
        </section>

        {message && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Income / Payments"
            value={`$${metrics.income.toLocaleString()}`}
            tone="cyan"
          />
          <MetricCard
            label="Expenses"
            value={`$${metrics.expenses.toLocaleString()}`}
          />
          <MetricCard
            label="Invoices"
            value={`$${metrics.invoices.toLocaleString()}`}
          />
          <MetricCard
            label="Payments"
            value={`$${metrics.payments.toLocaleString()}`}
          />
          <MetricCard
            label="Profit Snapshot"
            value={`$${metrics.profit.toLocaleString()}`}
            tone="lime"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="glass-panel-soft rounded-[28px] p-4 md:p-5 xl:sticky xl:top-6 xl:self-start">
            <div className="section-kicker">Add Entry</div>
            <div className="mt-3 panel-title">New Financial Record</div>
            <div className="panel-subtitle mt-2 text-sm">
              Log receipts, expenses, invoices, and incoming payments.
            </div>

            <form onSubmit={handleAddEntry} className="mt-5 space-y-3">
              <Field label="Entry Type">
                <select
                  value={entryType}
                  onChange={(e) =>
                    setEntryType(e.target.value as FinancialEntry["entry_type"])
                  }
                  className="ui-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="invoice">Invoice</option>
                  <option value="payment">Payment</option>
                </select>
              </Field>

              <Field label="Category">
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ui-input"
                  placeholder="Materials, labor, fuel..."
                />
              </Field>

              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="ui-input"
                  placeholder="Example: Sherwin Williams materials"
                />
              </Field>

              <Field label="Amount">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="ui-input"
                  placeholder="0.00"
                />
              </Field>

              <Field label="Job (optional)">
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="ui-select"
                >
                  <option value="">No linked job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.name || "Untitled Job"}
                      {job.customer ? ` — ${job.customer}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Vendor / Source">
                <input
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="ui-input"
                  placeholder="Vendor or source"
                />
              </Field>

              <Field label="Receipt URL (optional)">
                <input
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="ui-input"
                  placeholder="Paste uploaded receipt link"
                />
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="ui-input"
                />
              </Field>

              <Field label="Description (optional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="ui-textarea"
                  placeholder="Extra notes..."
                />
              </Field>

              <button
                type="submit"
                disabled={saving}
                className="ui-btn ui-btn-primary w-full disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Entry"}
              </button>
            </form>
          </aside>

          <div className="flex flex-col gap-6">
            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4">
                <div className="panel-title">Monthly Summary</div>
                <div className="panel-subtitle mt-1 text-sm">
                  Last 6 months of invoices, income, payments, and expenses.
                </div>
              </div>

              <div className="space-y-3">
                {monthlySummary.length === 0 ? (
                  <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                    No monthly data yet.
                  </div>
                ) : (
                  monthlySummary.map((month) => (
                    <div
                      key={month.key}
                      className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="mb-3 text-lg font-bold text-white">
                        {month.label}
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <MiniMetric title="Income" value={month.income} tone="cyan" />
                        <MiniMetric title="Expenses" value={month.expenses} />
                        <MiniMetric title="Invoices" value={month.invoices} />
                        <MiniMetric title="Payments" value={month.payments} tone="lime" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4">
                <div className="panel-title">Job Profitability</div>
                <div className="panel-subtitle mt-1 text-sm">
                  Estimated profit by project using tracked expenses and available revenue.
                </div>
              </div>

              <div className="space-y-3">
                {jobProfitability.length === 0 ? (
                  <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                    No job-linked financial data yet.
                  </div>
                ) : (
                  jobProfitability.map((row) => (
                    <div
                      key={row.jobId}
                      className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-lg font-bold text-white">
                            {row.jobName}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {row.customer}
                          </div>
                        </div>

                        <div
                          className={`ui-chip ${
                            row.estimatedProfit >= 0 ? "ui-chip-lime" : ""
                          }`}
                        >
                          Profit: ${row.estimatedProfit.toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-5">
                        <MiniMetric title="Quoted" value={row.quotedRevenue} />
                        <MiniMetric title="Income" value={row.trackedIncome} tone="cyan" />
                        <MiniMetric title="Expenses" value={row.trackedExpenses} />
                        <MiniMetric title="Invoices" value={row.invoiceTotal} />
                        <MiniMetric title="Payments" value={row.paymentTotal} tone="lime" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
              <div className="mb-4">
                <div className="panel-title">Recent Financial Activity</div>
                <div className="panel-subtitle mt-1 text-sm">
                  Latest recorded expenses, invoices, and payments.
                </div>
              </div>

              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
                    No financial entries yet.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="text-lg font-bold text-white">
                            {entry.title}
                          </div>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-400">
                            <span>{entry.category || "Uncategorized"}</span>
                            {entry.vendor && <span>• {entry.vendor}</span>}
                            <span>• {formatDate(entry.entry_date)}</span>
                          </div>

                          {entry.description && (
                            <div className="mt-3 text-sm leading-7 text-zinc-300">
                              {entry.description}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`ui-chip ${
                              entry.entry_type === "expense"
                                ? ""
                                : entry.entry_type === "invoice"
                                ? "ui-chip-cyan"
                                : "ui-chip-lime"
                            }`}
                          >
                            {entry.entry_type}
                          </span>

                          <span
                            className={`ui-chip ${
                              entry.entry_type === "expense"
                                ? ""
                                : "ui-chip-lime"
                            }`}
                          >
                            ${Number(entry.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {entry.receipt_url && (
                        <div className="mt-4">
                          <a
                            href={entry.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                          >
                            View Receipt
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "lime";
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div
        className={`metric-value ${
          tone === "cyan"
            ? "text-cyan-300"
            : tone === "lime"
            ? "text-lime-300"
            : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: number;
  tone?: "default" | "cyan" | "lime";
}) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div
        className={`mt-2 text-sm font-bold ${
          tone === "cyan"
            ? "text-cyan-300"
            : tone === "lime"
            ? "text-lime-300"
            : "text-white"
        }`}
      >
        ${value.toLocaleString()}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
      {children}
    </label>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
