"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "staff" | "installer" | "customer";
};

type WorkOrder = {
  id: string;
  title: string | null;
  description: string | null;
  materials: string | null;
  scheduled_date: string | null;
  status: "Open" | "In Progress" | "Completed";
  assigned_installer_id: string | null;
  assigned_installer_name: string | null;
};

type FilterMode = "all" | "open" | "in_progress" | "completed";

export default function InstallerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const currentProfile = await getCurrentProfile();

        if (!currentProfile) {
          router.replace("/login");
          return;
        }

        if (currentProfile.role !== "installer") {
          router.replace("/auth/callback");
          return;
        }

        setProfile(currentProfile as Profile);

        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .eq("assigned_installer_id", currentProfile.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setWorkOrders((data as WorkOrder[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load installer portal.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function updateStatus(
    workOrderId: string,
    nextStatus: "Open" | "In Progress" | "Completed"
  ) {
    setWorkingId(workOrderId);
    setMessage("");

    const { error } = await supabase
      .from("work_orders")
      .update({ status: nextStatus })
      .eq("id", workOrderId);

    if (error) {
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setWorkOrders((prev) =>
      prev.map((item) =>
        item.id === workOrderId ? { ...item, status: nextStatus } : item
      )
    );

    setWorkingId(null);
    setMessage("Work order updated.");
  }

  const installerName =
    profile?.full_name?.trim() ||
    profile?.email?.split("@")[0] ||
    "Installer";

  const stats = useMemo(() => {
    const open = workOrders.filter((item) => item.status === "Open").length;
    const inProgress = workOrders.filter(
      (item) => item.status === "In Progress"
    ).length;
    const completed = workOrders.filter(
      (item) => item.status === "Completed"
    ).length;

    const todayKey = new Date().toDateString();
    const todayCount = workOrders.filter((item) => {
      if (!item.scheduled_date) return false;
      return new Date(item.scheduled_date).toDateString() === todayKey;
    }).length;

    return { open, inProgress, completed, todayCount, total: workOrders.length };
  }, [workOrders]);

  const visibleWorkOrders = useMemo(() => {
    let next = [...workOrders];

    if (filter === "open") next = next.filter((item) => item.status === "Open");
    if (filter === "in_progress")
      next = next.filter((item) => item.status === "In Progress");
    if (filter === "completed")
      next = next.filter((item) => item.status === "Completed");

    const term = search.trim().toLowerCase();

    if (!term) return next;

    return next.filter((item) =>
      [
        item.title,
        item.description,
        item.materials,
        item.scheduled_date,
        item.status,
        item.assigned_installer_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [workOrders, filter, search]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>Loading installer portal...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.topBar}>
          <div style={styles.brandBlock}>
            <div style={styles.logoBox}>
              <Image
                src="/branding/app-logo.png"
                alt="ArtiPoxi Logo"
                width={96}
                height={96}
                style={styles.logo}
                priority
              />
            </div>

            <div>
              <div style={styles.brandName}>ARTIPOXI</div>
              <div style={styles.brandSub}>Installer Portal</div>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </header>

        <section style={styles.heroCard}>
          <div style={styles.kicker}>INSTALLER ACCESS</div>

          <div style={styles.heroTop}>
            <div>
              <h1 style={styles.title}>{installerName} Workspace</h1>
              <p style={styles.subtitle}>
                View assigned work orders, track today’s jobs, update progress,
                and stay locked in from the field.
              </p>
            </div>

            <div style={styles.totalPill}>
              {stats.total} Work Order{stats.total === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="Today" value={stats.todayCount} />
          <StatCard label="Open" value={stats.open} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Completed" value={stats.completed} />
        </section>

        <section style={styles.controlCard}>
          <input
            type="text"
            placeholder="Search work orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.filterRow}>
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton active={filter === "open"} onClick={() => setFilter("open")}>
              Open
            </FilterButton>
            <FilterButton
              active={filter === "in_progress"}
              onClick={() => setFilter("in_progress")}
            >
              In Progress
            </FilterButton>
            <FilterButton
              active={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </FilterButton>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.orders}>
          {visibleWorkOrders.length === 0 ? (
            <div style={styles.emptyCard}>
              <h2 style={styles.emptyTitle}>No matching work orders found.</h2>
              <p style={styles.emptyText}>
                Assigned jobs will appear here once they are scheduled.
              </p>
            </div>
          ) : (
            visibleWorkOrders.map((order) => {
              const isWorking = workingId === order.id;

              return (
                <article key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div>
                      <h2 style={styles.orderTitle}>
                        {order.title || "Untitled Work Order"}
                      </h2>

                      <div style={styles.pillRow}>
                        <span style={styles.darkPill}>
                          {order.assigned_installer_name || installerName}
                        </span>
                        <StatusPill status={order.status} />
                      </div>
                    </div>
                  </div>

                  <div style={styles.statusButtons}>
                    <StatusButton
                      active={order.status === "Open"}
                      onClick={() => updateStatus(order.id, "Open")}
                    >
                      {isWorking && order.status !== "Open" ? "Updating..." : "Open"}
                    </StatusButton>

                    <StatusButton
                      active={order.status === "In Progress"}
                      onClick={() => updateStatus(order.id, "In Progress")}
                    >
                      {isWorking && order.status !== "In Progress"
                        ? "Updating..."
                        : "In Progress"}
                    </StatusButton>

                    <StatusButton
                      active={order.status === "Completed"}
                      onClick={() => updateStatus(order.id, "Completed")}
                    >
                      {isWorking && order.status !== "Completed"
                        ? "Updating..."
                        : "Completed"}
                    </StatusButton>
                  </div>

                  <div style={styles.infoGrid}>
                    <InfoCard
                      title="Scheduled Date"
                      value={
                        order.scheduled_date
                          ? formatDate(order.scheduled_date)
                          : "Not scheduled"
                      }
                    />
                    <InfoCard title="Status" value={order.status} />
                    <InfoCard
                      title="Description"
                      value={order.description || "No description provided."}
                    />
                    <InfoCard
                      title="Materials"
                      value={order.materials || "No materials listed."}
                    />
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.filterButton,
        ...(active ? styles.activeButton : {}),
      }}
    >
      {children}
    </button>
  );
}

function StatusButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.statusButton,
        ...(active ? styles.activeButton : {}),
      }}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: WorkOrder["status"] }) {
  const color =
    status === "Completed"
      ? "#34d399"
      : status === "In Progress"
      ? "#fbbf24"
      : "#67e8f9";

  return (
    <span
      style={{
        ...styles.statusPill,
        color,
        borderColor: `${color}55`,
        background: `${color}16`,
      }}
    >
      {status}
    </span>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0, 198, 255, 0.18), transparent 35%), linear-gradient(135deg, #020713 0%, #061524 50%, #020713 100%)",
    color: "white",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrap: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "22px 16px 40px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 22,
  },
  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    background: "#ffffff",
    padding: 10,
    boxShadow: "0 20px 50px rgba(0, 183, 255, 0.16)",
    flex: "0 0 auto",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  brandName: {
    letterSpacing: "0.22em",
    fontWeight: 900,
    fontSize: 18,
  },
  brandSub: {
    color: "#cbd5e1",
    fontSize: 15,
    marginTop: 5,
  },
  logoutButton: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  heroCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "linear-gradient(180deg, rgba(22, 38, 55, 0.9), rgba(15, 26, 40, 0.9))",
    borderRadius: 34,
    padding: "28px 24px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
  },
  kicker: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.28em",
    marginBottom: 12,
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "clamp(38px, 8vw, 72px)",
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
    fontWeight: 950,
  },
  subtitle: {
    margin: "18px 0 0",
    color: "#cbd5e1",
    fontSize: "clamp(17px, 4vw, 22px)",
    lineHeight: 1.55,
    maxWidth: 780,
  },
  totalPill: {
    border: "1px solid rgba(103,232,249,0.35)",
    background: "rgba(103,232,249,0.12)",
    color: "#a5f3fc",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginTop: 18,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 26,
    padding: 18,
    minHeight: 115,
    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
  },
  statLabel: {
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 11,
    fontWeight: 900,
  },
  statValue: {
    marginTop: 12,
    fontSize: 38,
    fontWeight: 950,
  },
  controlCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 28,
    padding: 16,
    marginTop: 18,
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "white",
    borderRadius: 18,
    padding: "15px 16px",
    fontSize: 16,
    outline: "none",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  filterButton: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "#e5e7eb",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  activeButton: {
    borderColor: "rgba(34,211,238,0.45)",
    background: "linear-gradient(135deg, #00d5ff, #008cff)",
    color: "#00111f",
    boxShadow: "0 0 28px rgba(34,211,238,0.22)",
  },
  message: {
    marginTop: 18,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 14,
    color: "#cbd5e1",
  },
  orders: {
    marginTop: 18,
    display: "grid",
    gap: 16,
  },
  emptyCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 30,
    padding: 24,
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 950,
  },
  emptyText: {
    margin: "10px 0 0",
    color: "#cbd5e1",
    fontSize: 16,
  },
  orderCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 30,
    padding: 22,
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  orderTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  darkPill: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.24)",
    borderRadius: 999,
    padding: "8px 12px",
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: 800,
  },
  statusPill: {
    border: "1px solid",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 900,
  },
  statusButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  statusButton: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "#e5e7eb",
    borderRadius: 16,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginTop: 18,
  },
  infoCard: {
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.22)",
    borderRadius: 20,
    padding: 16,
  },
  infoTitle: {
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: 10,
    fontWeight: 900,
  },
  infoValue: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  loadingCard: {
    margin: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 20,
  },
};
