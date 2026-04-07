"use client";

import { useEffect, useState } from "react";
import { getCurrentProfile } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "installer" | "customer";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
};

type WorkOrder = {
  id: string;
  job_id: string | null;
  title: string | null;
  description: string | null;
  materials: string | null;
  scheduled_date: string | null;
  status: "Open" | "In Progress" | "Completed";
  assigned_installer_id: string | null;
  assigned_installer_name: string | null;
};

export default function InstallerWorkOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const profile = await getCurrentProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        if (profile.role === "admin" || profile.role === "staff") {
          router.replace("/dashboard/work-orders");
          return;
        }

        if (profile.role === "customer") {
          router.replace("/portal");
          return;
        }

        const { data, error } = await supabase
          .from("work_orders")
          .select(
            "id, job_id, title, description, materials, scheduled_date, status, assigned_installer_id, assigned_installer_name"
          )
          .eq("assigned_installer_id", profile.id)
          .order("scheduled_date", { ascending: true });

        if (error) throw error;

        setWorkOrders((data as WorkOrder[]) || []);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load work orders.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function updateStatus(
    workOrderId: string,
    newStatus: "Open" | "In Progress" | "Completed"
  ) {
    const { error } = await supabase
      .from("work_orders")
      .update({ status: newStatus })
      .eq("id", workOrderId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setWorkOrders((prev) =>
      prev.map((order) =>
        order.id === workOrderId ? { ...order, status: newStatus } : order
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          Loading work orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Installer Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold">My Work Orders</h1>
          <p className="mt-2 text-zinc-400">
            View and update only the work orders assigned to you.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-neutral-900 p-4 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-zinc-400">
              No assigned work orders yet.
            </div>
          ) : (
            workOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-neutral-900 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {order.title || "Untitled Work Order"}
                    </h2>
                    <div className="mt-2 text-sm text-zinc-400">
                      Scheduled: {order.scheduled_date || "-"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(order.id, "Open")}
                      className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-300"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "In Progress")}
                      className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "Completed")}
                      className="rounded-lg border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-sm font-semibold text-lime-300"
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Info label="Status" value={order.status} />
                  <Info label="Assigned To" value={order.assigned_installer_name || "-"} />
                </div>

                <div className="mt-5">
                  <div className="text-sm text-zinc-400">Description</div>
                  <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-4 text-zinc-200">
                    {order.description || "No description."}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-sm text-zinc-400">Materials</div>
                  <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-4 whitespace-pre-wrap text-zinc-200">
                    {order.materials || "No materials listed."}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-1 font-medium text-white">{value}</div>
    </div>
  );
}