"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { getCurrentProfile } from "../../../lib/auth";

type JobStatus =
  | "New"
  | "Quoted"
  | "Follow Up"
  | "Scheduled"
  | "In Progress"
  | "Completed";

type Job = {
  id: string;
  name: string | null;
  customer: string | null;
  customer_address: string | null;
  status: JobStatus | null;
  quoted_price: number | null;
  notes: string | null;
  assigned_installer_name?: string | null;
  scheduled_start?: string | null;
};

type WorkOrder = {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  scheduled_date: string | null;
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = Array.isArray(params?.jobId)
    ? params.jobId[0]
    : params?.jobId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [status, setStatus] = useState<JobStatus>("New");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const profile = await getCurrentProfile();

      if (!profile) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      setJob(data);

      setName(data.name || "");
      setCustomer(data.customer || "");
      setCustomerAddress(data.customer_address || "");
      setStatus((data.status || "New") as JobStatus);
      setPrice(data.quoted_price ? String(data.quoted_price) : "");
      setNotes(data.notes || "");

      const { data: wo } = await supabase
        .from("work_orders")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      setWorkOrders(wo || []);

      setLoading(false);
    }

    if (jobId) load();
  }, [jobId, router]);

  async function saveJob() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("jobs")
      .update({
        name,
        customer,
        customer_address: customerAddress,
        status,
        quoted_price: price ? Number(price) : null,
        notes,
      })
      .eq("id", jobId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Saved successfully.");
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="text-white">
      <div className="flex flex-col gap-6">
        
        {/* HERO */}
        <section className="hero-garage p-6 md:p-8">
          <div className="section-kicker">Job Details</div>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            {name || "Untitled Job"}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="ui-chip">{status}</span>

            <span className="ui-chip ui-chip-silver">
              {price ? `$${Number(price).toLocaleString()}` : "No Quote"}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/jobs" className="ui-btn">
              Back
            </Link>

            <button
              onClick={saveJob}
              className="ui-btn ui-btn-primary"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </section>

        {/* EDIT PANEL */}
        <section className="glass-panel-strong rounded-[28px] p-6">
          <h2 className="panel-title">Edit Job</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Job Name">
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field label="Customer">
              <input
                className="field"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Customer Address">
            <input
              className="field"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Street, city, state..."
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Field label="Status">
              <select
                className="field"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                <option>New</option>
                <option>Quoted</option>
                <option>Follow Up</option>
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </Field>

            <Field label="Quoted Price">
              <input
                type="number"
                className="field"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className="field-area"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          {message && (
            <div className="mt-4 text-sm text-zinc-400">{message}</div>
          )}
        </section>

        {/* WORK ORDERS */}
        <section className="glass-panel-soft rounded-[28px] p-6">
          <div className="flex justify-between items-center">
            <h2 className="panel-title">Work Orders</h2>

            <button className="ui-btn">+ Add</button>
          </div>

          <div className="mt-4 space-y-3">
            {workOrders.length === 0 ? (
              <div className="text-zinc-400">No work orders yet.</div>
            ) : (
              workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="rounded-[20px] border border-white/10 bg-black/30 p-4"
                >
                  <div className="text-lg font-bold">
                    {wo.title || "Untitled"}
                  </div>

                  <div className="text-sm text-zinc-400 mt-2">
                    {wo.description}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <span className="ui-chip">{wo.status}</span>
                    {wo.scheduled_date && (
                      <span className="ui-chip">
                        {new Date(wo.scheduled_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mt-4">
      <div className="mb-2 text-sm text-zinc-400">{label}</div>
      {children}
    </label>
  );
}