"use client";

import { useEffect, useState } from "react";
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

export default function InstallerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [message, setMessage] = useState("");

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
    const { error } = await supabase
      .from("work_orders")
      .update({ status: nextStatus })
      .eq("id", workOrderId);

    if (error) {
      alert(error.message);
      return;
    }

    setWorkOrders((prev) =>
      prev.map((item) =>
        item.id === workOrderId ? { ...item, status: nextStatus } : item
      )
    );
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 text-white">
        Loading installer portal...
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-6">
          <section className="glass-panel-soft rounded-[30px] p-6 md:p-8">
            <BrandMark href="/" subtitle="Installer Portal" size="md" />

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="section-kicker">Assigned Work</div>
                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  {profile?.full_name || "Installer"} Workspace
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                  View your assigned work orders, scheduled dates, and update job
                  progress from the field.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="ui-chip ui-chip-cyan">Installer Access</span>
                <span className="ui-chip">
                  {workOrders.length} Work Order{workOrders.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </section>

          {message && (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}

          <section className="space-y-4">
            {workOrders.length === 0 ? (
              <div className="glass-panel-soft rounded-[28px] p-6 text-zinc-400">
                No work orders assigned yet.
              </div>
            ) : (
              workOrders.map((order) => (
                <div
                  key={order.id}
                  className="glass-panel-soft rounded-[28px] p-5 md:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-2xl font-black tracking-tight text-white md:text-3xl">
                        {order.title || "Untitled Work Order"}
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">
                        {order.assigned_installer_name || "Assigned installer"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusButton
                        active={order.status === "Open"}
                        label="Open"
                        onClick={() => updateStatus(order.id, "Open")}
                      />
                      <StatusButton
                        active={order.status === "In Progress"}
                        label="In Progress"
                        onClick={() => updateStatus(order.id, "In Progress")}
                      />
                      <StatusButton
                        active={order.status === "Completed"}
                        label="Completed"
                        onClick={() => updateStatus(order.id, "Completed")}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <InfoCard
                      title="Scheduled Date"
                      value={order.scheduled_date ? formatDate(order.scheduled_date) : "Not scheduled"}
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
              ))
            )}
          </section>
        </div>
      </div>
    </main>
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

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}
