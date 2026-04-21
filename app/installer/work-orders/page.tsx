"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type WorkOrderStatus = "Ready" | "Scheduled" | "In Progress" | "Completed";

type WorkOrder = {
  id: string;
  title: string;
  client_name: string | null;
  status: WorkOrderStatus | null;
  address: string | null;
  install_date: string | null;
  notes: string | null;
  description?: string | null;
  materials?: string | null;
  assigned_installer_id?: string | null;
  assigned_installer_name?: string | null;
};

export default function InstallerWorkOrdersPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const installerProfile = await getCurrentProfile();

      if (!mounted) return;

      if (!installerProfile) {
        router.replace("/login");
        return;
      }

      if (!isInstaller(installerProfile.role)) {
        router.replace("/dashboard");
        return;
      }

      setProfile(installerProfile);

      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("assigned_installer_id", installerProfile.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error(error);
        setMessage("Could not load work orders.");
        setWorkOrders([]);
        setCheckingAuth(false);
        return;
      }

      setWorkOrders(((data as WorkOrder[]) || []).map(normalizeWorkOrder));
      setCheckingAuth(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function updateStatus(
    workOrderId: string,
    nextStatus: WorkOrderStatus
  ) {
    setWorkingId(workOrderId);
    setMessage("");

    const { error } = await supabase
      .from("work_orders")
      .update({ status: nextStatus })
      .eq("id", workOrderId);

    if (error) {
      console.error(error);
      setMessage(error.message);
      setWorkingId(null);
      return;
    }

    setWorkOrders((prev) =>
      prev.map((order) =>
        order.id === workOrderId ? { ...order, status: nextStatus } : order
      )
    );

    setWorkingId(null);
    setMessage("Work order updated.");
  }

  const filteredOrders = useMemo(() => {
    return workOrders.filter((order) => {
      const matchesStatus =
        selectedStatus === "All" ||
        (order.status ?? "").toLowerCase() === selectedStatus.toLowerCase();

      const haystack = [
        order.id,
        order.title,
        order.client_name ?? "",
        order.address ?? "",
        order.notes ?? "",
        order.description ?? "",
        order.materials ?? "",
        order.assigned_installer_name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && haystack.includes(search.trim().toLowerCase());
    });
  }, [workOrders, selectedStatus, search]);

  const stats = useMemo(() => {
    return {
      total: workOrders.length,
      ready: workOrders.filter((o) => o.status === "Ready").length,
      scheduled: workOrders.filter((o) => o.status === "Scheduled").length,
      inProgress: workOrders.filter((o) => o.status === "In Progress").length,
      completed: workOrders.filter((o) => o.status === "Completed").length,
    };
  }, [workOrders]);

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>Checking installer access...</div>
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
              <h2 className={styles.brandBottom}>Installer Hub</h2>
            </div>
          </div>

          <nav className={styles.sideNav}>
            <Link href="/installer/work-orders" className={styles.sideLinkActive}>
              Work Orders
            </Link>
            <Link href="/installer/schedule" className={styles.sideLink}>
              Schedule
            </Link>
          </nav>

          <div className={styles.sideFooter}>
            {profile?.email ? <p className={styles.userEmail}>{profile.email}</p> : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>INSTALLER WORKFLOW</p>
              <h1 className={styles.title}>Work Orders</h1>
              <p className={styles.subtitle}>
                Review assigned installs, track status, and stay focused on active field work.
              </p>
            </div>
          </header>

          <section className={styles.cardGrid}>
            <article className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div>
                  <p className={styles.orderId}>TOTAL</p>
                  <h3 className={styles.orderTitle}>{stats.total}</h3>
                </div>
                <span className={styles.statusBadge}>Assigned</span>
              </div>
            </article>

            <article className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div>
                  <p className={styles.orderId}>READY</p>
                  <h3 className={styles.orderTitle}>{stats.ready}</h3>
                </div>
                <span className={styles.statusBadge}>Ready</span>
              </div>
            </article>

            <article className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div>
                  <p className={styles.orderId}>IN PROGRESS</p>
                  <h3 className={styles.orderTitle}>{stats.inProgress}</h3>
                </div>
                <span className={styles.statusBadge}>Active</span>
              </div>
            </article>

            <article className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div>
                  <p className={styles.orderId}>COMPLETED</p>
                  <h3 className={styles.orderTitle}>{stats.completed}</h3>
                </div>
                <span className={styles.statusBadge}>Done</span>
              </div>
            </article>
          </section>

          <section className={styles.filterBar}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search work orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className={styles.statusSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option>All</option>
              <option>Ready</option>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </section>

          {message ? (
            <div className={styles.notesBlock} style={{ marginBottom: 16 }}>
              <p className={styles.notesLabel}>Message</p>
              <p className={styles.notesText}>{message}</p>
            </div>
          ) : null}

          <section className={styles.cardGrid}>
            {filteredOrders.length === 0 ? (
              <article className={styles.orderCard}>
                <div className={styles.notesBlock}>
                  <p className={styles.notesLabel}>No Results</p>
                  <p className={styles.notesText}>
                    No work orders match the current search or status filter.
                  </p>
                </div>
              </article>
            ) : (
              filteredOrders.map((order) => {
                const isWorking = workingId === order.id;

                return (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <p className={styles.orderId}>{order.id}</p>
                        <h3 className={styles.orderTitle}>
                          {order.title || "Untitled Work Order"}
                        </h3>
                      </div>

                      <span className={styles.statusBadge}>
                        {order.status ?? "Open"}
                      </span>
                    </div>

                    <div className={styles.infoGrid}>
                      <Info label="Client" value={order.client_name ?? "—"} />
                      <Info label="Address" value={order.address ?? "—"} />
                      <Info
                        label="Install Date"
                        value={order.install_date ? formatDate(order.install_date) : "—"}
                      />
                    </div>

                    <div className={styles.notesBlock}>
                      <p className={styles.notesLabel}>Description</p>
                      <p className={styles.notesText}>
                        {order.description || "No description provided."}
                      </p>
                    </div>

                    <div className={styles.notesBlock}>
                      <p className={styles.notesLabel}>Materials</p>
                      <p className={styles.notesText}>
                        {order.materials || "No materials listed."}
                      </p>
                    </div>

                    <div className={styles.notesBlock}>
                      <p className={styles.notesLabel}>Notes</p>
                      <p className={styles.notesText}>
                        {order.notes || "No notes added yet."}
                      </p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => updateStatus(order.id, "Ready")}
                        disabled={isWorking}
                      >
                        {isWorking && order.status !== "Ready" ? "Updating..." : "Ready"}
                      </button>

                      <button
                        className={styles.actionGhostBtn}
                        onClick={() => updateStatus(order.id, "In Progress")}
                        disabled={isWorking}
                      >
                        In Progress
                      </button>

                      <button
                        className={styles.actionGhostBtn}
                        onClick={() => updateStatus(order.id, "Completed")}
                        disabled={isWorking}
                      >
                        Completed
                      </button>
                    </div>
                  </article>
                );
              })
            )}
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

function normalizeWorkOrder(order: any): WorkOrder {
  return {
    id: String(order.id ?? ""),
    title: order.title ?? "Untitled Work Order",
    client_name: order.client_name ?? order.customer ?? null,
    status: normalizeStatus(order.status),
    address: order.address ?? order.location ?? null,
    install_date: order.install_date ?? order.scheduled_date ?? null,
    notes: order.notes ?? null,
    description: order.description ?? null,
    materials: order.materials ?? null,
    assigned_installer_id: order.assigned_installer_id ?? null,
    assigned_installer_name: order.assigned_installer_name ?? null,
  };
}

function normalizeStatus(value: any): WorkOrderStatus {
  const text = String(value ?? "").toLowerCase();

  if (text === "in progress" || text === "in_progress") return "In Progress";
  if (text === "completed" || text === "complete") return "Completed";
  if (text === "scheduled") return "Scheduled";
  return "Ready";
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
