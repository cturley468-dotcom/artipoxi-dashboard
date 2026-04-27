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

  const installerDisplayName =
    profile?.full_name ||
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

    return {
      open,
      inProgress,
      completed,
      todayCount,
      total: workOrders.length,
    };
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
      <main className="min-h-screen bg-[#020711] p-5 text-white">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          Loading installer portal...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,153,255,0.18),transparent_32%),linear-gradient(135deg,#020711,#06111f_55%,#020711)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <aside className="flex items-center justify-between border-b border-white/10 bg-black/20 p-4 md:sticky md:top-0 md:min-h-screen md:w-[230px] md:flex-col md:items-start md:border-b-0 md:border-r md:p-5">
          <div className="flex items-center gap-3 md:block">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 md:h-20 md:w-20">
              <Image
                src="/branding/app-logo.png"
                alt="ArtiPoxi Logo"
                width={100}
                height={100}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="md:mt-5">
              <h2 className="text-xl font-black md:text-2xl">ArtiPoxi</h2>
              <p className="text-xs font-semibold text-zinc-400">
                Installer Portal
              </p>
            </div>
          </div>

          <div className="hidden w-full md:mt-8 md:block">
            <div className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              Assigned Work
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:border-cyan-400/30 md:mt-auto md:w-full"
          >
            Logout
          </button>
        </aside>

        <section className="flex-1 px-4 py-5 md:px-6 md:py-8">
          <header className="mb-6">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
              Installer Access
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {installerDisplayName} Workspace
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                  View assigned work orders, track today’s jobs, update progress,
                  and stay locked in from the field.
                </p>
              </div>

              <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-200">
                {stats.total} Work Order{stats.total === 1 ? "" : "s"}
              </span>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Today" value={String(stats.todayCount)} />
            <StatCard label="Open" value={String(stats.open)} />
            <StatCard label="In Progress" value={String(stats.inProgress)} />
            <StatCard label="Completed" value={String(stats.completed)} />
          </section>

          <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-2xl">
            <input
              type="text"
              placeholder="Search work orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
            />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <FilterButton
                active={filter === "all"}
                label="All"
                onClick={() => setFilter("all")}
              />
              <FilterButton
                active={filter === "open"}
                label="Open"
                onClick={() => setFilter("open")}
              />
              <FilterButton
                active={filter === "in_progress"}
                label="In Progress"
                onClick={() => setFilter("in_progress")}
              />
              <FilterButton
                active={filter === "completed"}
                label="Completed"
                onClick={() => setFilter("completed")}
              />
            </div>
          </section>

          {message && (
            <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}

          <section className="mt-5 space-y-4">
            {visibleWorkOrders.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6 text-zinc-400">
                <h3 className="text-lg font-black text-white">
                  No matching work orders found.
                </h3>
                <p className="mt-2 text-sm">
                  Assigned jobs will appear here once they are scheduled.
                </p>
              </div>
            ) : (
              visibleWorkOrders.map((order) => {
                const isWorking = workingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="rounded-[26px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="text-2xl font-black tracking-tight text-white md:text-3xl">
                            {order.title || "Untitled Work Order"}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-zinc-300">
                              {order.assigned_installer_name ||
                                installerDisplayName}
                            </span>
                            <StatusPill status={order.status} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                          <StatusButton
                            active={order.status === "Open"}
                            label={
                              isWorking && order.status !== "Open"
                                ? "Updating..."
                                : "Open"
                            }
                            onClick={() => updateStatus(order.id, "Open")}
                          />
                          <StatusButton
                            active={order.status === "In Progress"}
                            label={
                              isWorking && order.status !== "In Progress"
                                ? "Updating..."
                                : "In Progress"
                            }
                            onClick={() =>
                              updateStatus(order.id, "In Progress")
                            }
                          />
                          <StatusButton
                            active={order.status === "Completed"}
                            label={
                              isWorking && order.status !== "Completed"
                                ? "Updating..."
                                : "Completed"
                            }
                            onClick={() =>
                              updateStatus(order.id, "Completed")
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl sm:p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </div>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white">
        {value}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400 text-white shadow-[0_0_22px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-400/30"
      }`}
    >
      {label}
    </button>
  );
}

function StatusButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400 text-white shadow-[0_0_22px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-400/30"
      }`}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: WorkOrder["status"] }) {
  const className =
    status === "Completed"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : status === "In Progress"
      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

  return (
    <span className={`rounded-full border px-3 py-2 text-xs font-black ${className}`}>
      {status}
    </span>
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
