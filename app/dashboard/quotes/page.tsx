"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type Quote = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  project_name: string | null;
  square_feet: number | null;
  coating_type: string | null;
  prep_level: string | null;
  extras: string[] | null;
  coating_cost: number | null;
  prep_cost: number | null;
  extras_cost: number | null;
  total_estimate: number | null;
  status: string | null;
};

export default function QuotesPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
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
      void fetchQuotes();
    }
  }, [checkingAuth]);

  async function fetchQuotes() {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setQuotes((data as Quote[]) || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleConvertToJob(quote: Quote) {
    setWorkingId(quote.id);
    setMessage("");

    const { error } = await supabase.from("jobs").insert([
      {
        quote_id: quote.id,
        title: quote.project_name || "New Quote Job",
        client_name: quote.customer_name || "Unknown Client",
        client_email: quote.customer_email || null,
        status: "open",
        price: quote.total_estimate || 0,
        notes: `Created from quote ${quote.id}`,
      },
    ]);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    await supabase.from("quotes").update({ status: "converted" }).eq("id", quote.id);

    setMessage("Quote converted to job.");
    setWorkingId(null);
    await fetchQuotes();
  }

  async function handleDeleteQuote(id: string) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setMessage("Quote deleted.");
    setWorkingId(null);
    await fetchQuotes();
  }

  const filteredQuotes = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return quotes;

    return quotes.filter((quote) =>
      [
        quote.customer_name ?? "",
        quote.customer_email ?? "",
        quote.project_name ?? "",
        quote.coating_type ?? "",
        quote.prep_level ?? "",
        quote.status ?? "",
        quote.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [quotes, search]);

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
            <Link href="/dashboard/quotes" className={styles.sideLinkActive}>
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
              <p className={styles.eyebrow}>QUOTE MANAGEMENT</p>
              <h1 className={styles.title}>Saved Quotes</h1>
              <p className={styles.subtitle}>
                Review saved quotes, reopen them in the configurator, or convert them into jobs later.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/configurator" className={styles.primaryBtn}>
                New Quote
              </Link>
              <Link href="/dashboard/jobs" className={styles.secondaryBtn}>
                Open Jobs
              </Link>
            </div>
          </header>

          <section className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search saved quotes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          {message ? <p className={styles.message}>{message}</p> : null}

          <section className={styles.quoteGrid}>
            {filteredQuotes.map((quote) => (
              <article key={quote.id} className={styles.quoteCard}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.quoteId}>Quote ID: {quote.id}</p>
                    <h3 className={styles.quoteTitle}>{quote.project_name || "Untitled Project"}</h3>
                  </div>

                  <span className={styles.statusBadge}>{quote.status || "draft"}</span>
                </div>

                <div className={styles.infoGrid}>
                  <Info label="Customer" value={quote.customer_name || "—"} />
                  <Info label="Email" value={quote.customer_email || "—"} />
                  <Info label="Square Feet" value={String(quote.square_feet ?? "—")} />
                  <Info label="Coating" value={quote.coating_type || "—"} />
                  <Info label="Prep" value={quote.prep_level || "—"} />
                  <Info
                    label="Created"
                    value={new Date(quote.created_at).toLocaleDateString("en-US")}
                  />
                </div>

                <div className={styles.totalRow}>
                  <span>Total Estimate</span>
                  <strong>${Number(quote.total_estimate || 0).toLocaleString()}</strong>
                </div>

                <div className={styles.cardActions}>
                  <Link href={`/configurator?quoteId=${quote.id}`} className={styles.actionBtn}>
                    Open Quote
                  </Link>

                  <button
                    className={styles.actionGhostBtn}
                    onClick={() => handleConvertToJob(quote)}
                    disabled={workingId === quote.id}
                  >
                    {workingId === quote.id ? "Working..." : "Convert to Job"}
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteQuote(quote.id)}
                    disabled={workingId === quote.id}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {!filteredQuotes.length ? (
              <div className={styles.emptyCard}>
                <h3>No saved quotes yet</h3>
                <p>Create a quote in the configurator and it will appear here.</p>
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
