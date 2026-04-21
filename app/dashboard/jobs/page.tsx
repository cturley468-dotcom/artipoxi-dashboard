"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const JOBS_STORAGE_KEY = "artipoxi_jobs";

type Job = {
  id: string;
  quote_request_id: string | null;
  customer: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  square_footage: number | null;
  system_type: string | null;
  notes: string | null;
  photo_urls: string[] | null;
  status: string;
  value: number | null;
  created_at: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  installer?: string | null;
};

type Invoice = {
  id: string;
  job_id: string;
  invoice_number: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  billing_address?: string | null;
  project_address?: string | null;
  status: string | null;
  issue_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax: number | null;
  discount?: number | null;
  total: number | null;
  amount_paid: number | null;
  balance_due: number | null;
  notes: string | null;
  created_at: string;
};

type WorkOrderLite = {
  id: string;
  job_id: string | null;
  title: string | null;
  status: string | null;
  scheduled_date: string | null;
  assigned_installer_name?: string | null;
};

type NewJobForm = {
  customer: string;
  phone: string;
  email: string;
  location: string;
  square_footage: string;
  system_type: string;
  notes: string;
  value: string;
  installer: string;
  scheduled_date: string;
  scheduled_time: string;
};

type EditJobForm = {
  customer: string;
  phone: string;
  email: string;
  location: string;
  square_footage: string;
  system_type: string;
  notes: string;
  value: string;
  installer: string;
  scheduled_date: string;
  scheduled_time: string;
};

function getPhotoUrl(pathOrUrl: string) {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const { data } = supabase.storage.from("quote-photos").getPublicUrl(pathOrUrl);
  return data.publicUrl;
}

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderLite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [workingJobId, setWorkingJobId] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);

  const [newJobForm, setNewJobForm] = useState<NewJobForm>({
    customer: "",
    phone: "",
    email: "",
    location: "",
    square_footage: "",
    system_type: "",
    notes: "",
    value: "",
    installer: "",
    scheduled_date: "",
    scheduled_time: "",
  });

  const [editJobForm, setEditJobForm] = useState<EditJobForm>({
    customer: "",
    phone: "",
    email: "",
    location: "",
    square_footage: "",
    system_type: "",
    notes: "",
    value: "",
    installer: "",
    scheduled_date: "",
    scheduled_time: "",
  });

  useEffect(() => {
    void loadJobs();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxUrl(null);
        setShowNewJobModal(false);
        setEditingJobId(null);
        setOpenActionsId(null);
      }
    }

    function handleWindowClick() {
      setOpenActionsId(null);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  function syncJobsToScheduleStorage(nextJobs: Job[]) {
    try {
      const mapped = nextJobs.map((job) => ({
        id: String(job.id),
        customer: job.customer ?? "",
        customer_name: job.customer ?? "",
        full_name: job.customer ?? "",
        phone: job.phone ?? "",
        email: job.email ?? "",
        location: job.location ?? "",
        city: job.location ?? "",
        installer: job.installer ?? "Unassigned",
        crew: job.installer ?? "Unassigned",
        system: job.system_type ?? "Epoxy System",
        project_type: job.system_type ?? "Epoxy System",
        notes: job.notes ?? "",
        value: job.value ?? 0,
        square_footage: job.square_footage ?? null,
        status: job.status ?? "open",
        preferredTime: job.scheduled_time ?? "8:00 AM",
        preferred_time: job.scheduled_time ?? "8:00 AM",
        scheduled_date: job.scheduled_date ?? null,
        scheduled_time: job.scheduled_time ?? null,
        created_at: job.created_at,
        quote_request_id: job.quote_request_id ?? null,
      }));

      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(mapped));
    } catch {
      // ignore local sync issues
    }
  }

  async function loadJobs() {
    setLoading(true);
    setMessage("");

    const [jobsRes, invoicesRes, workOrdersRes] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase
        .from("work_orders")
        .select("id, job_id, title, status, scheduled_date, assigned_installer_name")
        .order("created_at", { ascending: false }),
    ]);

    if (jobsRes.error) {
      console.error("Failed to load jobs:", jobsRes.error);
      setJobs([]);
      setMessage("Could not load jobs.");
      setLoading(false);
      return;
    }

    const nextJobs = ((jobsRes.data as Job[]) || []).map((job) => ({
      ...job,
      scheduled_date: (job as any).scheduled_date ?? null,
      scheduled_time: (job as any).scheduled_time ?? null,
      installer: (job as any).installer ?? null,
    }));

    setJobs(nextJobs);
    syncJobsToScheduleStorage(nextJobs);

    if (invoicesRes.error) {
      console.error("Failed to load invoices:", invoicesRes.error);
      setInvoices([]);
    } else {
      setInvoices((invoicesRes.data as Invoice[]) || []);
    }

    if (workOrdersRes.error) {
      console.error("Failed to load work orders:", workOrdersRes.error);
      setWorkOrders([]);
    } else {
      setWorkOrders((workOrdersRes.data as WorkOrderLite[]) || []);
    }

    setLoading(false);
  }

  async function uploadJobPhotos(files: File[]) {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
      const filePath = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeName}`;

      const { error } = await supabase.storage
        .from("quote-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const { data } = supabase.storage.from("quote-photos").getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  }

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobs;

    return jobs.filter((job) =>
      [
        job.id,
        job.customer,
        job.phone,
        job.email,
        job.location,
        job.system_type,
        job.notes,
        job.status,
        job.value?.toString(),
        job.square_footage?.toString(),
        job.installer,
        job.scheduled_date,
        job.scheduled_time,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [jobs, search]);

  const openCount = jobs.filter((job) => job.status === "open").length;
  const scheduledCount = jobs.filter((job) => job.status === "scheduled").length;
  const inProgressCount = jobs.filter((job) => job.status === "in_progress").length;
  const openValue = jobs
    .filter((job) => job.status !== "complete")
    .reduce((sum, job) => sum + Number(job.value || 0), 0);

  function getInvoiceForJob(jobId: string) {
    return invoices.find((invoice) => invoice.job_id === jobId) || null;
  }

  function getWorkOrdersForJob(jobId: string) {
    return workOrders.filter((order) => order.job_id === jobId);
  }

  function startEditJob(job: Job) {
    setEditingJobId(job.id);
    setMessage("");
    setOpenActionsId(null);

    setEditJobForm({
      customer: job.customer ?? "",
      phone: job.phone ?? "",
      email: job.email ?? "",
      location: job.location ?? "",
      square_footage:
        job.square_footage !== null && job.square_footage !== undefined
          ? String(job.square_footage)
          : "",
      system_type: job.system_type ?? "",
      notes: job.notes ?? "",
      value:
        job.value !== null && job.value !== undefined
          ? String(job.value)
          : "",
      installer: job.installer ?? "",
      scheduled_date: job.scheduled_date ?? "",
      scheduled_time: job.scheduled_time ?? "",
    });
  }

  function cancelEditJob() {
    setEditingJobId(null);
    setMessage("");
  }

  async function saveJobEdit(jobId: string) {
    setWorkingJobId(jobId);
    setMessage("");

    const payload = {
      customer: editJobForm.customer.trim() || "New Job",
      phone: editJobForm.phone.trim() || null,
      email: editJobForm.email.trim() || null,
      location: editJobForm.location.trim() || null,
      square_footage: editJobForm.square_footage ? Number(editJobForm.square_footage) : null,
      system_type: editJobForm.system_type.trim() || null,
      notes: editJobForm.notes.trim() || null,
      value: editJobForm.value ? Number(editJobForm.value) : 0,
      installer: editJobForm.installer.trim() || null,
      scheduled_date: editJobForm.scheduled_date || null,
      scheduled_time: editJobForm.scheduled_time || null,
    };

    const { error } = await supabase.from("jobs").update(payload).eq("id", jobId);

    if (error) {
      console.error(error);
      setMessage(`Could not save job changes: ${error.message}`);
      setWorkingJobId(null);
      return;
    }

    setEditingJobId(null);
    setWorkingJobId(null);
    setMessage("Job updated.");
    await loadJobs();
  }

  async function createNewJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingJob(true);
    setMessage("");

    const payload = {
      customer: newJobForm.customer.trim() || "New Job",
      phone: newJobForm.phone.trim() || null,
      email: newJobForm.email.trim() || null,
      location: newJobForm.location.trim() || null,
      square_footage: newJobForm.square_footage ? Number(newJobForm.square_footage) : null,
      system_type: newJobForm.system_type.trim() || null,
      notes: newJobForm.notes.trim() || null,
      value: newJobForm.value ? Number(newJobForm.value) : 0,
      installer: newJobForm.installer.trim() || null,
      scheduled_date: newJobForm.scheduled_date || null,
      scheduled_time: newJobForm.scheduled_time || null,
      status: newJobForm.scheduled_date ? "scheduled" : "open",
      photo_urls: [],
    };

    const { error } = await supabase.from("jobs").insert([payload]);

    if (error) {
      console.error(error);
      setMessage(`Could not create job: ${error.message}`);
      setCreatingJob(false);
      return;
    }

    setNewJobForm({
      customer: "",
      phone: "",
      email: "",
      location: "",
      square_footage: "",
      system_type: "",
      notes: "",
      value: "",
      installer: "",
      scheduled_date: "",
      scheduled_time: "",
    });

    setCreatingJob(false);
    setShowNewJobModal(false);
    setMessage("New job created.");
    await loadJobs();
  }

  async function updateJobStatus(jobId: string, nextStatus: string) {
    setWorkingJobId(jobId);
    setMessage("");

    const { error } = await supabase.from("jobs").update({ status: nextStatus }).eq("id", jobId);

    if (error) {
      console.error(error);
      setMessage("Could not update job status.");
      setWorkingJobId(null);
      return;
    }

    setWorkingJobId(null);
    setOpenActionsId(null);
    setMessage("Job updated.");
    await loadJobs();
  }

  async function sendJobToSchedule(job: Job) {
    setWorkingJobId(job.id);
    setMessage("");

    const nextScheduledDate = job.scheduled_date || new Date().toISOString().split("T")[0];
    const nextScheduledTime = job.scheduled_time || "8:00 AM";

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "scheduled",
        scheduled_date: nextScheduledDate,
        scheduled_time: nextScheduledTime,
        installer: job.installer || "Unassigned",
      })
      .eq("id", job.id);

    if (error) {
      console.error(error);
      setMessage(`Could not send job to schedule: ${error.message}`);
      setWorkingJobId(null);
      return;
    }

    setWorkingJobId(null);
    setOpenActionsId(null);
    setMessage("Job is now ready in schedule.");
    await loadJobs();
  }

  async function createInvoiceForJob(job: Job) {
    setWorkingJobId(job.id);
    setMessage("");

    const existing = getInvoiceForJob(job.id);
    if (existing) {
      setWorkingJobId(null);
      setMessage("This job already has an invoice.");
      router.push(`/dashboard/invoices/${existing.id}`);
      return;
    }

    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 14);

    const subtotal = Number(job.value || 0);
    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          job_id: job.id,
          invoice_number: invoiceNumber,
          customer_name: job.customer || null,
          customer_email: job.email || null,
          customer_phone: job.phone || null,
          billing_address: job.location || null,
          project_address: job.location || null,
          status: "draft",
          issue_date: today.toISOString().split("T")[0],
          due_date: due.toISOString().split("T")[0],
          subtotal,
          tax,
          discount,
          total,
          amount_paid: 0,
          balance_due: total,
          notes: `Invoice created from job ${job.customer || job.id}.`,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error(error);
      setMessage(`Could not create invoice: ${error.message}`);
      setWorkingJobId(null);
      return;
    }

    setWorkingJobId(null);
    setMessage("Invoice created.");

    if (data?.id) {
      router.push(`/dashboard/invoices/${data.id}`);
      return;
    }

    await loadJobs();
  }

  async function cycleInvoiceStatus(invoice: Invoice) {
    const current = (invoice.status || "draft").toLowerCase();
    const next = current === "draft" ? "sent" : current === "sent" ? "paid" : "draft";

    const nextAmountPaid =
      next === "paid" ? Number(invoice.total || 0) : Number(invoice.amount_paid || 0);
    const nextBalance =
      next === "paid"
        ? 0
        : Number(invoice.total || 0) - Number(invoice.amount_paid || 0);

    const { error } = await supabase
      .from("invoices")
      .update({
        status: next,
        amount_paid: nextAmountPaid,
        balance_due: nextBalance,
      })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      setMessage(`Could not update invoice: ${error.message}`);
      return;
    }

    setMessage(`Invoice marked ${next}.`);
    await loadJobs();
  }

  async function appendPhotosToJob(
    job: Job,
    files: FileList | null,
    label: "progress" | "completion"
  ) {
    if (!files || files.length === 0) return;

    setWorkingJobId(job.id);
    setMessage("");

    try {
      const uploadedUrls = await uploadJobPhotos(Array.from(files));
      const existing = Array.isArray(job.photo_urls) ? job.photo_urls : [];
      const combined = [...existing, ...uploadedUrls];

      let nextNotes = job.notes?.trim() || "";
      const stamp = new Date().toLocaleString();
      const line =
        label === "progress"
          ? `[Progress photos added: ${stamp}]`
          : `[Completion photos added: ${stamp}]`;

      nextNotes = nextNotes ? `${nextNotes}\n${line}` : line;

      const { error } = await supabase
        .from("jobs")
        .update({
          photo_urls: combined,
          notes: nextNotes,
        })
        .eq("id", job.id);

      if (error) {
        throw error;
      }

      setMessage(label === "progress" ? "Progress photos added." : "Completion photos added.");
      await loadJobs();
    } catch (error: any) {
      console.error(error);
      setMessage(`Could not add photos: ${error.message || "unknown error"}`);
    } finally {
      setWorkingJobId(null);
    }
  }

  return (
    <section style={pageWrap}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>PROJECT TRACKING</div>
          <h1 style={titleStyle}>Jobs</h1>
          <p style={subtitleStyle}>
            Track saved jobs, work orders, invoice foundation, schedule fields,
            and project photos from one page.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button
            style={primaryActionStyle}
            type="button"
            onClick={() => setShowNewJobModal(true)}
          >
            New Job
          </button>
        </div>
      </div>

      <div style={{ ...heroCardStyle, ...(isMobile ? heroCardMobileStyle : null) }}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Jobs Snapshot</div>
          <div style={heroBigTextStyle}>Keep production moving.</div>
          <div style={heroTextStyle}>
            View open jobs, update statuses, assign schedule fields, connect work orders,
            and start invoice tracking now.
          </div>
        </div>

        <div style={{ ...heroRightStyle, ...(isMobile ? heroRightMobileStyle : null) }}>
          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>OPEN</div>
            <div style={miniStatValueStyle}>{openCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>SCHEDULED</div>
            <div style={miniStatValueStyle}>{scheduledCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>IN PROGRESS</div>
            <div style={miniStatValueStyle}>{inProgressCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>OPEN VALUE</div>
            <div style={miniStatValueStyle}>${openValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={toolbarStyle}>
        <input
          type="text"
          placeholder="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {message ? <div style={messageBoxStyle}>{message}</div> : null}

      {loading ? (
        <div style={emptyPanelStyle}>Loading jobs...</div>
      ) : visibleJobs.length === 0 ? (
        <div style={emptyPanelStyle}>
          No jobs yet. Convert a quote into a job or create one manually.
        </div>
      ) : (
        <div style={rowsWrapStyle}>
          {visibleJobs.map((job) => {
            const photos = Array.isArray(job.photo_urls) ? job.photo_urls : [];
            const isWorking = workingJobId === job.id;
            const isEditing = editingJobId === job.id;
            const invoice = getInvoiceForJob(job.id);
            const linkedWorkOrders = getWorkOrdersForJob(job.id);
            const actionsOpen = openActionsId === job.id;

            return (
              <article key={job.id} style={jobRowCardStyle}>
                <div style={jobTopStyle}>
                  <div style={jobTopLeftStyle}>
                    <div style={jobIdStyle}>Job ID: {job.id}</div>
                    <div style={jobTitleStyle}>{job.customer}</div>
                    <div style={jobMetaStyle}>
                      {job.location || "No location"} • {formatDate(job.created_at)}
                    </div>
                  </div>

                  <div style={jobTopRightStyle}>
                    <div
                      style={{
                        ...statusBadgeStyle,
                        ...(job.status === "complete"
                          ? completeBadgeStyle
                          : job.status === "in_progress"
                          ? progressBadgeStyle
                          : job.status === "scheduled"
                          ? scheduledBadgeStyle
                          : openBadgeStyle),
                      }}
                    >
                      {formatStatus(job.status)}
                    </div>

                    <div
                      style={actionsMenuWrapStyle}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        style={ghostButtonStyle}
                        onClick={() => setOpenActionsId(actionsOpen ? null : job.id)}
                      >
                        Actions ▾
                      </button>

                      {actionsOpen ? (
                        <div style={actionsDropdownStyle}>
                          <button
                            type="button"
                            style={dropdownButtonStyle}
                            onClick={() => startEditJob(job)}
                            disabled={isWorking}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={dropdownButtonStyle}
                            onClick={() => updateJobStatus(job.id, "open")}
                            disabled={isWorking}
                          >
                            Mark Open
                          </button>
                          <button
                            type="button"
                            style={dropdownButtonStyle}
                            onClick={() => updateJobStatus(job.id, "scheduled")}
                            disabled={isWorking}
                          >
                            Mark Scheduled
                          </button>
                          <button
                            type="button"
                            style={dropdownButtonStyle}
                            onClick={() => updateJobStatus(job.id, "in_progress")}
                            disabled={isWorking}
                          >
                            Mark In Progress
                          </button>
                          <button
                            type="button"
                            style={dropdownButtonStyle}
                            onClick={() => sendJobToSchedule(job)}
                            disabled={isWorking}
                          >
                            Send to Schedule
                          </button>
                          <button
                            type="button"
                            style={dropdownButtonPrimaryStyle}
                            onClick={() => updateJobStatus(job.id, "complete")}
                            disabled={isWorking}
                          >
                            Complete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ ...editGridStyle, ...(isMobile ? editGridMobileStyle : null) }}>
                    <input
                      style={editInputStyle}
                      placeholder="Customer"
                      value={editJobForm.customer}
                      onChange={(e) => setEditJobForm({ ...editJobForm, customer: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Phone"
                      value={editJobForm.phone}
                      onChange={(e) => setEditJobForm({ ...editJobForm, phone: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Email"
                      value={editJobForm.email}
                      onChange={(e) => setEditJobForm({ ...editJobForm, email: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Location"
                      value={editJobForm.location}
                      onChange={(e) => setEditJobForm({ ...editJobForm, location: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Square Footage"
                      value={editJobForm.square_footage}
                      onChange={(e) => setEditJobForm({ ...editJobForm, square_footage: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="System Type"
                      value={editJobForm.system_type}
                      onChange={(e) => setEditJobForm({ ...editJobForm, system_type: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Job Value"
                      value={editJobForm.value}
                      onChange={(e) => setEditJobForm({ ...editJobForm, value: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Installer / Crew"
                      value={editJobForm.installer}
                      onChange={(e) => setEditJobForm({ ...editJobForm, installer: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      type="date"
                      value={editJobForm.scheduled_date}
                      onChange={(e) => setEditJobForm({ ...editJobForm, scheduled_date: e.target.value })}
                    />
                    <input
                      style={editInputStyle}
                      placeholder="Scheduled Time"
                      value={editJobForm.scheduled_time}
                      onChange={(e) => setEditJobForm({ ...editJobForm, scheduled_time: e.target.value })}
                    />
                    <textarea
                      style={editTextareaStyle}
                      placeholder="Notes"
                      value={editJobForm.notes}
                      onChange={(e) => setEditJobForm({ ...editJobForm, notes: e.target.value })}
                    />

                    <div style={editActionsRowStyle}>
                      <button
                        type="button"
                        style={primaryButtonStyle}
                        onClick={() => saveJobEdit(job.id)}
                        disabled={isWorking}
                      >
                        {isWorking ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        style={ghostButtonStyle}
                        onClick={cancelEditJob}
                        disabled={isWorking}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={jobUploadRow}>
                      <label style={uploadLabelButton}>
                        Add Progress Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={hiddenInput}
                          onChange={(e) => appendPhotosToJob(job, e.target.files, "progress")}
                        />
                      </label>

                      <label style={uploadLabelButton}>
                        Add Completion Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={hiddenInput}
                          onChange={(e) => appendPhotosToJob(job, e.target.files, "completion")}
                        />
                      </label>
                    </div>

                    <div style={{ ...detailsGridStyle, ...(isMobile ? detailsGridMobileStyle : null) }}>
                      <Info label="System" value={job.system_type} />
                      <Info
                        label="Value"
                        value={
                          job.value !== null && job.value !== undefined
                            ? `$${Number(job.value).toLocaleString()}`
                            : "$0"
                        }
                      />
                      <Info label="Phone" value={job.phone} />
                      <Info label="Email" value={job.email} />
                      <Info
                        label="Square Footage"
                        value={
                          job.square_footage !== null && job.square_footage !== undefined
                            ? String(job.square_footage)
                            : "—"
                        }
                      />
                      <Info
                        label="Source Quote"
                        value={job.quote_request_id ? "Converted quote" : "Manual job"}
                      />
                      <Info label="Installer" value={job.installer} />
                      <Info label="Scheduled Date" value={job.scheduled_date} />
                      <Info label="Scheduled Time" value={job.scheduled_time} />
                    </div>

                    <div style={{ ...systemBlocksGridStyle, ...(isMobile ? systemBlocksGridMobileStyle : null) }}>
                      <div style={systemBlockStyle}>
                        <div style={notesLabelStyle}>WORK ORDERS</div>
                        {linkedWorkOrders.length === 0 ? (
                          <div style={notesTextStyle}>No work orders linked yet.</div>
                        ) : (
                          <div style={miniListStyle}>
                            {linkedWorkOrders.map((order) => (
                              <div key={order.id} style={miniListRowStyle}>
                                <div>
                                  <div style={miniListTitleStyle}>
                                    {order.title || "Untitled Work Order"}
                                  </div>
                                  <div style={miniListMetaStyle}>
                                    {(order.status || "open").toUpperCase()}
                                    {order.scheduled_date ? ` • ${formatDate(order.scheduled_date)}` : ""}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={systemBlockStyle}>
                        <div style={invoiceBlockTopStyle}>
                          <div style={notesLabelStyle}>INVOICE</div>

                          {invoice ? (
                            <div style={invoiceActionWrapStyle}>
                              <button
                                type="button"
                                style={ghostButtonStyle}
                                onClick={() => cycleInvoiceStatus(invoice)}
                              >
                                Cycle Status
                              </button>
                              <button
                                type="button"
                                style={primaryButtonStyle}
                                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                              >
                                Open Invoice
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              style={primaryButtonStyle}
                              onClick={() => createInvoiceForJob(job)}
                              disabled={isWorking}
                            >
                              {isWorking ? "Creating..." : "Create Invoice"}
                            </button>
                          )}
                        </div>

                        {invoice ? (
                          <div style={invoiceSummaryGridStyle}>
                            <Info label="Invoice #" value={invoice.invoice_number || "Draft"} />
                            <Info label="Status" value={invoice.status || "draft"} />
                            <Info
                              label="Total"
                              value={`$${Number(invoice.total || 0).toLocaleString()}`}
                            />
                            <Info
                              label="Balance Due"
                              value={`$${Number(invoice.balance_due || 0).toLocaleString()}`}
                            />
                          </div>
                        ) : (
                          <div style={notesTextStyle}>
                            Invoice system is next. This job is ready to connect.
                          </div>
                        )}
                      </div>
                    </div>

                    {photos.length > 0 ? (
                      <div style={photosSectionStyle}>
                        <div style={notesLabelStyle}>Project Photos</div>
                        <div style={{ ...photoGridStyle, ...(isMobile ? photoGridMobileStyle : null) }}>
                          {photos.map((raw, index) => {
                            const url = getPhotoUrl(raw);
                            return (
                              <button
                                key={`${job.id}-${index}`}
                                type="button"
                                style={photoButtonStyle}
                                onClick={() => setLightboxUrl(url)}
                              >
                                <img
                                  src={url}
                                  alt={`Job photo ${index + 1}`}
                                  style={photoThumbStyle}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div style={notesBoxStyle}>
                      <div style={notesLabelStyle}>Notes</div>
                      <div style={notesTextStyle}>
                        {job.notes?.trim() || "No notes added yet."}
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}

      {showNewJobModal ? (
        <div style={modalOverlay} onClick={() => setShowNewJobModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalTop}>
              <h2 style={modalTitle}>Create New Job</h2>
              <button
                type="button"
                style={modalClose}
                onClick={() => setShowNewJobModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createNewJob} style={modalForm}>
              <div style={{ ...newJobGrid, ...(isMobile ? newJobGridMobile : null) }}>
                <input
                  style={modalInput}
                  placeholder="Customer Name"
                  value={newJobForm.customer}
                  onChange={(e) => setNewJobForm({ ...newJobForm, customer: e.target.value })}
                  required
                />
                <input
                  style={modalInput}
                  placeholder="Phone"
                  value={newJobForm.phone}
                  onChange={(e) => setNewJobForm({ ...newJobForm, phone: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Email"
                  value={newJobForm.email}
                  onChange={(e) => setNewJobForm({ ...newJobForm, email: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Location"
                  value={newJobForm.location}
                  onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Square Footage"
                  value={newJobForm.square_footage}
                  onChange={(e) => setNewJobForm({ ...newJobForm, square_footage: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="System Type"
                  value={newJobForm.system_type}
                  onChange={(e) => setNewJobForm({ ...newJobForm, system_type: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Job Value"
                  value={newJobForm.value}
                  onChange={(e) => setNewJobForm({ ...newJobForm, value: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Installer / Crew"
                  value={newJobForm.installer}
                  onChange={(e) => setNewJobForm({ ...newJobForm, installer: e.target.value })}
                />
                <input
                  style={modalInput}
                  type="date"
                  value={newJobForm.scheduled_date}
                  onChange={(e) => setNewJobForm({ ...newJobForm, scheduled_date: e.target.value })}
                />
                <input
                  style={modalInput}
                  placeholder="Scheduled Time"
                  value={newJobForm.scheduled_time}
                  onChange={(e) => setNewJobForm({ ...newJobForm, scheduled_time: e.target.value })}
                />
                <textarea
                  style={modalTextarea}
                  placeholder="Job notes"
                  value={newJobForm.notes}
                  onChange={(e) => setNewJobForm({ ...newJobForm, notes: e.target.value })}
                />
              </div>

              <div style={modalActions}>
                <button type="submit" style={primaryActionStyle} disabled={creatingJob}>
                  {creatingJob ? "Creating..." : "Create Job"}
                </button>
                <button
                  type="button"
                  style={ghostButtonStyle}
                  onClick={() => setShowNewJobModal(false)}
                  disabled={creatingJob}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {lightboxUrl ? (
        <div style={lightboxOverlay} onClick={() => setLightboxUrl(null)}>
          <button type="button" onClick={() => setLightboxUrl(null)} style={lightboxClose}>
            ×
          </button>
          <img
            src={lightboxUrl}
            alt="Expanded project photo"
            style={lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value?.trim() || "—"}</div>
    </div>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "in_progress":
      return "in progress";
    default:
      return status;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

const pageWrap: React.CSSProperties = { width: "100%" };

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#8fdfff",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "64px",
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
};

const topActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
  border: "none",
  cursor: "pointer",
};

const heroCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "16px",
  marginBottom: "18px",
  borderRadius: "24px",
  padding: "22px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const heroCardMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const heroLeftStyle: React.CSSProperties = {};

const heroSmallLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.16em",
  color: "#8fdfff",
  marginBottom: "10px",
};

const heroBigTextStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: "12px",
};

const heroTextStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.78)",
  lineHeight: 1.7,
};

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const heroRightMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const miniStatStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniStatLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const miniStatValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
};

const toolbarStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};

const messageBoxStyle: React.CSSProperties = {
  marginBottom: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.08)",
  border: "1px solid rgba(0,198,255,0.18)",
  color: "#9fe8ff",
};

const emptyPanelStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  color: "rgba(231,243,255,0.82)",
};

const rowsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "12px",
};

const jobRowCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: 0,
  overflow: "visible",
};

const jobTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const jobTopLeftStyle: React.CSSProperties = {
  minWidth: 0,
  flex: "1 1 260px",
};

const jobTopRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  flexWrap: "wrap",
  position: "relative",
};

const jobIdStyle: React.CSSProperties = {
  color: "#8fdfff",
  fontSize: "13px",
  fontWeight: 700,
  wordBreak: "break-all",
  marginBottom: "6px",
};

const jobTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  marginBottom: "6px",
  lineHeight: 1.1,
  wordBreak: "break-word",
};

const jobMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "capitalize",
  whiteSpace: "nowrap",
};

const openBadgeStyle: React.CSSProperties = {
  color: "#bfe8ff",
  background: "rgba(0, 198, 255, 0.12)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
};

const scheduledBadgeStyle: React.CSSProperties = {
  color: "#ffe9b3",
  background: "rgba(255, 191, 0, 0.12)",
  border: "1px solid rgba(255, 191, 0, 0.22)",
};

const progressBadgeStyle: React.CSSProperties = {
  color: "#ffd3d3",
  background: "rgba(255, 90, 90, 0.12)",
  border: "1px solid rgba(255, 90, 90, 0.22)",
};

const completeBadgeStyle: React.CSSProperties = {
  color: "#bfffd6",
  background: "rgba(52, 199, 89, 0.12)",
  border: "1px solid rgba(52, 199, 89, 0.22)",
};

const actionsMenuWrapStyle: React.CSSProperties = {
  position: "relative",
};

const actionsDropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "44px",
  right: 0,
  minWidth: "190px",
  display: "grid",
  gap: "8px",
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(10,16,28,0.96)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
  zIndex: 50,
};

const dropdownButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
  textAlign: "left",
};

const dropdownButtonPrimaryStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
  textAlign: "left",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const ghostButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};

const editGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};

const editGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const editInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};

const editTextareaStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  minHeight: "100px",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
  resize: "vertical",
};

const editActionsRowStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "6px",
};

const detailsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: "10px",
};

const detailsGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const infoBoxStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  minWidth: 0,
  overflow: "hidden",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "6px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const jobUploadRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const uploadLabelButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "9px 12px",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const hiddenInput: React.CSSProperties = {
  display: "none",
};

const systemBlocksGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "12px",
};

const systemBlocksGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const systemBlockStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const invoiceBlockTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const invoiceActionWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const invoiceSummaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const miniListStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const miniListRowStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const miniListTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "white",
};

const miniListMetaStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
};

const photosSectionStyle: React.CSSProperties = {
  marginTop: "12px",
};

const photoGridStyle: React.CSSProperties = {
  marginTop: "8px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
  gap: "10px",
};

const photoGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
};

const photoButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  display: "block",
};

const photoThumbStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "block",
};

const notesBoxStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const notesLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "6px",
};

const notesTextStyle: React.CSSProperties = {
  lineHeight: 1.5,
  color: "rgba(231,243,255,0.82)",
  wordBreak: "break-word",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.68)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9998,
};

const modalCard: React.CSSProperties = {
  width: "100%",
  maxWidth: "860px",
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(18,25,38,0.98), rgba(10,16,28,0.96))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
};

const modalTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const modalTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  color: "white",
};

const modalClose: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "28px",
  lineHeight: 1,
  cursor: "pointer",
};

const modalForm: React.CSSProperties = {
  display: "block",
};

const newJobGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};

const newJobGridMobile: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const modalInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  outline: "none",
};

const modalTextarea: React.CSSProperties = {
  gridColumn: "1 / -1",
  minHeight: "110px",
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  outline: "none",
  resize: "vertical",
};

const modalActions: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const lightboxOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 9999,
};

const lightboxImage: React.CSSProperties = {
  maxWidth: "92vw",
  maxHeight: "88vh",
  borderRadius: "16px",
  objectFit: "contain",
  boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
};

const lightboxClose: React.CSSProperties = {
  position: "absolute",
  top: "16px",
  right: "20px",
  width: "44px",
  height: "44px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "28px",
  lineHeight: 1,
  cursor: "pointer",
};