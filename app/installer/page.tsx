"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "../components/BrandMark";
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

  const stats = useMemo(() => {
    const open = workOrders.filter((item) => item.status === "Open").length;
    const inProgress = workOrders.filter((item) => item.status === "In Progress").length;
    const completed = workOrders.filter((item) => item.status === "Completed").length;

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

    if (filter === "open") {
      next = next.filter((item) => item.status === "Open");
    }

    if (filter === "in_progress") {
      next = next.filter((item) => item.status === "In Progress");
    }

    if (filter === "completed") {
      next = next.filter((item) => item.status === "Completed");
    }

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
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading installer portal...
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-6">
          <section className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <BrandMark href="/" subtitle="Installer Portal" size="md" />

            <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="section-kicker">Assigned Work</div>
                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  {profile?.full_name || "Installer"} Workspace
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                  View assigned work orders, track today’s jobs, update progress,
                  and stay locked in from the field.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="ui-chip ui-chip-cyan">Installer Access</span>
                <span className="ui-chip">
                  {stats.total} Work Order{stats.total === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Today" value={String(stats.todayCount)} tone="cyan" />
            <StatCard label="Open" value={String(stats.open)} />
            <StatCard label="In Progress" value={String(stats.inProgress)} tone="amber" />
            <StatCard label="Completed" value={String(stats.completed)} tone="green" />
          </section>

          <section className="glass-panel-soft rounded-[28px] p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                placeholder="Search work orders"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xl rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/30"
              />

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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
            </div>
          </section>

          {message && (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}

          <section className="space-y-4">
            {visibleWorkOrders.length === 0 ? (
              <div className="glass-panel-soft rounded-[28px] p-6 text-zinc-400">
                No matching work orders found.
              </div>
            ) : (
              visibleWorkOrders.map((order) => {
                const isWorking = workingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="glass-panel-soft rounded-[28px] p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="text-2xl font-black tracking-tight text-white md:text-3xl">
                            {order.title || "Untitled Work Order"}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="ui-chip">
                              {order.assigned_installer_name || "Assigned installer"}
                            </span>
                            <StatusPill status={order.status} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <StatusButton
                            active={order.status === "Open"}
                            label={isWorking && order.status !== "Open" ? "Updating..." : "Open"}
                            onClick={() => updateStatus(order.id, "Open")}
                          />
                          <StatusButton
                            active={order.status === "In Progress"}
                            label={
                              isWorking && order.status !== "In Progress"
                                ? "Updating..."
                                : "In Progress"
                            }
                            onClick={() => updateStatus(order.id, "In Progress")}
                          />
                          <StatusButton
                            active={order.status === "Completed"}
                            label={
                              isWorking && order.status !== "Completed"
                                ? "Updating..."
                                : "Completed"
                            }
                            onClick={() => updateStatus(order.id, "Completed")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <InfoCard
                          title="Scheduled Date"
                          value={
                            order.scheduled_date
                              ? formatDate(order.scheduled_date)
                              : "Not scheduled"
                          }
                        />
                        <InfoCard
                          title="Status"
                          value={order.status}
                        />
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
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan" | "amber" | "green";
}) {
  const valueClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "amber"
      ? "text-amber-300"
      : tone === "green"
      ? "text-emerald-300"
      : "text-white";

  return (
    <div className="glass-panel-soft rounded-[24px] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
      <div className={`mt-3 text-3xl font-black ${valueClass}`}>{value}</div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white">
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
      className={`rounded-[14px] border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-300 shadow-[0_0_18px_rgba(73,230,255,0.08)]"
          : "border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-400/20"
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
      className={`rounded-[14px] border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/12 text-cyan-300 shadow-[0_0_18px_rgba(73,230,255,0.08)]"
          : "border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-400/20"
      }`}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: WorkOrder["status"] }) {
  const className =
    status === "Completed"
      ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-300"
      : status === "In Progress"
      ? "border-amber-400/30 bg-amber-400/12 text-amber-300"
      : "border-cyan-400/30 bg-cyan-400/12 text-cyan-300";

  return (
    <span className={`ui-chip border ${className}`}>
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
