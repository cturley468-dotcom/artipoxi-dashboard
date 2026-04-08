"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "../lib/auth";
import { supabase } from "../lib/supabase";
import BrandMark from "../components/BrandMark";

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
      } catch (error) {
        console.error(error);
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
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading installer portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <BrandMark href="/" subtitle="Installer Portal" size="md" />
          <h1 className="mt-6 text-4xl font-bold">Assigned Work Orders</h1>
          <p className="mt-3 text-zinc-400">
            View only the work assigned to you and update progress.
          </p>
          {profile?.full_name && (
            <div className="mt-4 text-sm text-cyan-300">{profile.full_name}</div>
          )}
        </div>

        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-zinc-400">
              No work orders assigned yet.
            </div>
          ) : (
            workOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-neutral-900 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {order.title || "Untitled Work Order"}
                    </div>
                    <div className="mt-2 text-zinc-400">
                      Scheduled: {order.scheduled_date || "Not set"}
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

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoCard
                    title="Description"
                    value={order.description || "No description."}
                  />
                  <InfoCard
                    title="Materials"
                    value={order.materials || "No materials listed."}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="mt-2 whitespace-pre-wrap text-white">{value}</div>
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
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
          : "border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-400/20"
      }`}
    >
      {label}
    </button>
  );
}
