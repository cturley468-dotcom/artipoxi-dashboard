"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type WorkOrder = {
  id: string;
  customer_name?: string | null;
  city?: string | null;
  status?: string | null;
  scheduled_date?: string | null;
  project_type?: string | null;
  details?: string | null;
};

export default function InstallerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [installerName, setInstallerName] = useState("Installer");
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function loadPage() {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      const name =
        authData.user.user_metadata?.full_name ||
        authData.user.email?.split("@")[0] ||
        "Installer";

      setInstallerName(name);

      const { data } = await supabase
        .from("jobs")
        .select("*")
        .order("scheduled_date", { ascending: true });

      setOrders(data || []);
      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.customer_name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (order.city || "").toLowerCase().includes(search.toLowerCase()) ||
        (order.project_type || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || (order.status || "Open") === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const todayCount = orders.filter((o) => {
    if (!o.scheduled_date) return false;
    const today = new Date().toISOString().slice(0, 10);
    return o.scheduled_date.slice(0, 10) === today;
  }).length;

  const openCount = orders.filter((o) => (o.status || "Open") === "Open").length;
  const progressCount = orders.filter((o) => o.status === "In Progress").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Loading installer workspace...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <aside style={styles.sidebar}>
          <Image
            src="/branding/app-logo.png"
            alt="ArtiPoxi Logo"
            width={76}
            height={76}
            style={styles.logo}
          />

          <div>
            <h2 style={styles.brand}>ArtiPoxi</h2>
            <p style={styles.portal}>Installer Portal</p>
          </div>

          <nav style={styles.nav}>
            <div style={styles.navItemActive}>Assigned Work</div>
          </nav>

          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </aside>

        <section style={styles.content}>
          <header style={styles.header}>
            <div>
              <p style={styles.eyebrow}>Installer Access</p>
              <h1 style={styles.title}>{installerName} Workspace</h1>
              <p style={styles.subtitle}>
                View assigned work orders, track today’s jobs, update progress,
                and stay locked in from the field.
              </p>
            </div>

            <button onClick={handleLogout} style={styles.mobileLogout}>
              Logout
            </button>
          </header>

          <section style={styles.statsGrid}>
            <StatCard label="Work Orders Today" value={todayCount} />
            <StatCard label="Open" value={openCount} />
            <StatCard label="In Progress" value={progressCount} />
            <StatCard label="Completed" value={completedCount} />
          </section>

          <section style={styles.controls}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work orders"
              style={styles.search}
            />

            <div style={styles.filters}>
              {["All", "Open", "In Progress", "Completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  style={{
                    ...styles.filterButton,
                    ...(filter === item ? styles.filterButtonActive : {}),
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section style={styles.ordersGrid}>
            {filteredOrders.length === 0 ? (
              <div style={styles.emptyCard}>
                <h3 style={styles.emptyTitle}>No matching work orders found.</h3>
                <p style={styles.emptyText}>
                  Assigned jobs will appear here once they are scheduled.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article key={order.id} style={styles.orderCard}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.customer}>
                        {order.customer_name || "Unnamed Customer"}
                      </h3>
                      <p style={styles.location}>{order.city || "No city set"}</p>
                    </div>

                    <span style={styles.status}>{order.status || "Open"}</span>
                  </div>

                  <p style={styles.project}>
                    {order.project_type || "Epoxy Floor Project"}
                  </p>

                  <p style={styles.details}>
                    {order.details || "No job details added yet."}
                  </p>

                  <div style={styles.dateBox}>
                    Scheduled:{" "}
                    <strong>
                      {order.scheduled_date
                        ? new Date(order.scheduled_date).toLocaleDateString()
                        : "Not scheduled"}
                    </strong>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <h2 style={styles.statValue}>{value}</h2>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0, 132, 255, 0.25), transparent 35%), linear-gradient(135deg, #020611, #06111f 55%, #020611)",
    color: "#f8fbff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  shell: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: 260,
    padding: 24,
    background: "rgba(2, 8, 20, 0.92)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  logo: {
    borderRadius: 18,
    objectFit: "contain",
    background: "#fff",
    padding: 8,
  },
  brand: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
  },
  portal: {
    margin: "4px 0 0",
    color: "#9fb7d8",
    fontSize: 14,
  },
  nav: {
    marginTop: 20,
  },
  navItemActive: {
    padding: "13px 14px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #0077ff, #00b7ff)",
    fontWeight: 800,
  },
  logout: {
    marginTop: "auto",
    padding: "13px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: 28,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    marginBottom: 24,
  },
  eyebrow: {
    margin: 0,
    color: "#4cc9ff",
    fontWeight: 900,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    margin: "8px 0",
    fontSize: "clamp(34px, 5vw, 58px)",
    lineHeight: 1,
    fontWeight: 900,
  },
  subtitle: {
    maxWidth: 760,
    margin: 0,
    color: "#b9c8dc",
    fontSize: 18,
    lineHeight: 1.6,
  },
  mobileLogout: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(140px, 1fr))",
    gap: 16,
    marginBottom: 22,
  },
  statCard: {
    padding: 20,
    borderRadius: 22,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  statLabel: {
    margin: 0,
    color: "#aabbd2",
    fontSize: 14,
    fontWeight: 700,
  },
  statValue: {
    margin: "10px 0 0",
    fontSize: 36,
  },
  controls: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  search: {
    flex: "1 1 280px",
    padding: "15px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 16,
    outline: "none",
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.07)",
    color: "#dce9fb",
    fontWeight: 800,
    cursor: "pointer",
  },
  filterButtonActive: {
    background: "linear-gradient(135deg, #0077ff, #00b7ff)",
    color: "#fff",
  },
  ordersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  orderCard: {
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.075)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
  },
  customer: {
    margin: 0,
    fontSize: 22,
  },
  location: {
    margin: "5px 0 0",
    color: "#9fb7d8",
  },
  status: {
    height: "fit-content",
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(0,183,255,0.15)",
    border: "1px solid rgba(0,183,255,0.35)",
    color: "#8ee4ff",
    fontWeight: 900,
    fontSize: 12,
  },
  project: {
    margin: "18px 0 8px",
    fontWeight: 900,
    color: "#ffffff",
  },
  details: {
    margin: 0,
    color: "#b9c8dc",
    lineHeight: 1.5,
  },
  dateBox: {
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    background: "rgba(0,0,0,0.22)",
    color: "#dce9fb",
  },
  emptyCard: {
    gridColumn: "1 / -1",
    padding: 28,
    borderRadius: 24,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 22,
  },
  emptyText: {
    margin: "8px 0 0",
    color: "#aabbd2",
  },
  loading: {
    padding: 32,
    fontSize: 20,
  },
};
