"use client";

export default function FinancePage() {
  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        <section className="hero-garage p-5 md:p-7">
          <div className="section-kicker">Owner Finance Hub</div>
          <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            Financial
            <br />
            Control.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
            Track expenses, incoming payments, monthly activity, and business-level numbers in one owner-focused space.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Income / Payments" value="$0" />
          <StatCard label="Expenses" value="$0" />
          <StatCard label="Invoices" value="$0" />
          <StatCard label="Profit" value="$0" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="glass-panel-strong rounded-[28px] p-6">
            <div className="panel-title">New Financial Record</div>
            <div className="panel-subtitle mt-2 text-sm">
              Log receipts, invoices, expenses, and incoming payments.
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="field" placeholder="Record title" />
              <select className="field">
                <option>Expense</option>
                <option>Payment</option>
                <option>Invoice</option>
                <option>Material Purchase</option>
              </select>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="field" placeholder="Amount" />
              <input className="field" placeholder="Related job (optional)" />
            </div>

            <div className="mt-4">
              <textarea className="field-area" placeholder="Notes" />
            </div>

            <div className="mt-4">
              <button className="ui-btn ui-btn-primary">Save Record</button>
            </div>
          </section>

          <section className="glass-panel-soft rounded-[28px] p-6">
            <div className="panel-title">Recent Activity</div>
            <div className="panel-subtitle mt-2 text-sm">No financial records yet.</div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/35 p-4 backdrop-blur md:p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-100">{value}</div>
    </div>
  );
}
