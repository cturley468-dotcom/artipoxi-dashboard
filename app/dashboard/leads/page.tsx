"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  project_type: string | null;
  status: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
};

const demoLeads: Lead[] = [
  {
    id: "LD-1001",
    name: "John Smith",
    email: "johnsmith@email.com",
    phone: "(864) 555-0181",
    project_type: "Garage Epoxy",
    status: "New",
    source: "Website",
    notes: "Wants charcoal flake system. Asked about timeline.",
    created_at: "2026-04-09T10:00:00Z",
  },
  {
    id: "LD-1002",
    name: "Sarah Turner",
    email: "sturner@email.com",
    phone: "(864) 555-0192",
    project_type: "Patio Coating",
    status: "Contacted",
    source: "Instagram",
    notes: "Interested in satin finish and outdoor durability.",
    created_at: "2026-04-08T14:00:00Z",
  },
  {
    id: "LD-1003",
    name: "Harris Auto",
    email: "office@harrisauto.com",
    phone: "(864) 555-0129",
    project_type: "Shop Floor",
    status: "Quoted",
    source: "Referral",
    notes: "Needs quote for back room and showroom.",
    created_at: "2026-04-07T09:30:00Z",
  },
];

export default function LeadsPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
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
      void fetchLeads();
    }
  }, [checkingAuth]);

  async function fetchLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLeads(demoLeads);
      setMessage("Using demo leads until the leads table is connected.");
      return;
    }

    setLeads((data as Lead[]) || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function updateLeadStatus(id: string, status: string) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setWorkingId(null);
    await fetchLeads();
  }

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return leads;

    return leads.filter((lead) =>
      [
        lead.id,
        lead.name,
        lead.email ?? "",
        lead.phone ?? "",
        lead.project_type ?? "",
        lead.status ?? "",
        lead.source ?? "",
        lead.notes ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [leads, search]);

  const newCount = filteredLeads.filter((x) => (x.status ?? "").toLowerCase() === "new").length;
  const contactedCount = filteredLeads.filter((x) => (x.status ?? "").toLowerCase() === "contacted").length;
  const quotedCount = filteredLeads.filter((x) => (x.status ?? "").toLowerCase() === "quoted").length;
  const closedCount = filteredLeads.filter((x) => (x.status ?? "").toLowerCase() === "closed").length;

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
            <Link href="/dashboard/leads" className={styles.sideLinkActive}>
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
              <p className={styles.eyebrow}>LEAD PIPELINE</p>
              <h1 className={styles.title}>Leads</h1>
              <p className={styles.subtitle}>
                Track incoming prospects, move them through the pipeline, and keep follow-up organized.
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

          <section className={styles.heroPanel}>
            <div>
              <p className={styles.heroTag}>Leads Snapshot</p>
              <h2 className={styles.heroTitle}>Stay on top of every opportunity.</h2>
              <p className={styles.heroText}>
                Review fresh leads, track quote progress, and keep the customer pipeline moving forward.
              </p>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>New</span>
                <strong className={styles.heroMiniValue}>{newCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Contacted</span>
                <strong className={styles.heroMiniValue}>{contactedCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Quoted</span>
                <strong className={styles.heroMiniValue}>{quotedCount}</strong>
              </div>
              <div className={styles.heroMiniCard}>
                <span className={styles.heroMiniLabel}>Closed</span>
                <strong className={styles.heroMiniValue}>{closedCount}</strong>
              </div>
            </div>
          </section>

          <section className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          {message ? <p className={styles.message}>{message}</p> : null}

          <section className={styles.leadGrid}>
            {filteredLeads.map((lead) => (
              <article key={lead.id} className={styles.leadCard}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.leadId}>{lead.id}</p>
                    <h3 className={styles.leadTitle}>{lead.name}</h3>
                  </div>

                  <span className={styles.statusBadge}>{lead.status || "New"}</span>
                </div>

                <div className={styles.infoGrid}>
                  <Info label="Email" value={lead.email || "—"} />
                  <Info label="Phone" value={lead.phone || "—"} />
                  <Info label="Project" value={lead.project_type || "—"} />
                  <Info label="Source" value={lead.source || "—"} />
                  <Info
                    label="Created"
                    value={new Date(lead.created_at).toLocaleDateString("en-US")}
                  />
                </div>

                <div className={styles.notesBlock}>
                  <p className={styles.notesLabel}>Notes</p>
                  <p className={styles.notesText}>{lead.notes || "No notes added yet."}</p>
                </div>

                <div className={styles.statusActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => updateLeadStatus(lead.id, "New")}
                    disabled={workingId === lead.id}
                  >
                    New
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => updateLeadStatus(lead.id, "Contacted")}
                    disabled={workingId === lead.id}
                  >
                    Contacted
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => updateLeadStatus(lead.id, "Quoted")}
                    disabled={workingId === lead.id}
                  >
                    Quoted
                  </button>

                  <button
                    className={styles.actionGhostBtn}
                    onClick={() => updateLeadStatus(lead.id, "Closed")}
                    disabled={workingId === lead.id}
                  >
                    Closed
                  </button>
                </div>
              </article>
            ))}

            {!filteredLeads.length ? (
              <div className={styles.emptyCard}>
                <h3>No leads found</h3>
                <p>Add leads to your database and they will appear here.</p>
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
