"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  title: string;
  client_name: string;
  status: string;
  price: number;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [price, setPrice] = useState("");

  async function fetchJobs() {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function createJob() {
    if (!title || !client) return;

    await supabase.from("jobs").insert([
      {
        title,
        client_name: client,
        status: "open",
        price: Number(price) || 0,
      },
    ]);

    setTitle("");
    setClient("");
    setPrice("");

    fetchJobs();
  }

  async function deleteJob(id: string) {
    await supabase.from("jobs").delete().eq("id", id);
    fetchJobs();
  }

  return (
    <main style={{ padding: 24, color: "white" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Jobs</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Client Name"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={createJob}>Add Job</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} style={{ marginBottom: 12 }}>
            <strong>{job.title}</strong> — {job.client_name} — ${job.price}
            <button onClick={() => deleteJob(job.id)}>Delete</button>
          </div>
        ))
      )}
    </main>
  );
}
