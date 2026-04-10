"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../lib/auth";
import styles from "./page.module.css";

type WorkOrder = {
  id: string;
  title: string;
  client_name: string | null;
  status: string | null;
  address: string | null;
  install_date: string | null;
  notes: string | null;
};

const demoWorkOrders: WorkOrder[] = [
  {
    id: "WO-1042",
    title: "Garage Epoxy Install",
    client_name: "Smith Residence",
    status: "Scheduled",
    address: "Anderson, SC",
    install_date: "2026-04-14",
    notes: "Prep floor, grind surface, metallic charcoal finish.",
  },
  {
    id: "WO-1043",
    title: "Shop Floor Coating",
    client_name: "Harris Auto",
    status: "In Progress",
    address: "Greenville, SC",
    install_date: "2026-04-16",
    notes: "Back room first, then front showroom.",
  },
  {
    id: "WO-1044",
    title: "Patio Seal + Finish",
    client_name: "Turner Property",
    status: "Ready",
    address: "Belton, SC",
    install_date: "2026-04-19",
    notes: "Customer requested satin topcoat.",
  },
];

export default function InstallerWorkOrdersPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(demoWorkOrders);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");

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
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && haystack.includes(search.toLowerCase());
    });
  }, [workOrders, selectedStatus, search]);

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
              <option>Complete</option>
            </select>
          </section>

          <section className={styles.cardGrid}>
            {filteredOrders.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>{order.id}</p>
                    <h3 className={styles.orderTitle}>{order.title}</h3>
                  </div>

                  <span className={styles.statusBadge}>{order.status ?? "Open"}</span>
                </div>

                <div className={styles.infoGrid}>
                  <Info label="Client" value={order.client_name ?? "—"} />
                  <Info label="Address" value={order.address ?? "—"} />
                  <Info label="Install Date" value={order.install_date ?? "—"} />
                </div>

                <div className={styles.notesBlock}>
                  <p className={styles.notesLabel}>Notes</p>
                  <p className={styles.notesText}>{order.notes ?? "No notes added yet."}</p>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.actionBtn}>Open Details</button>
                  <button className={styles.actionGhostBtn}>Mark Updated</button>
                </div>
              </article>
            ))}
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
