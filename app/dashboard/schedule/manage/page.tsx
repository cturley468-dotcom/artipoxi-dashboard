"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getCurrentProfile, isInstaller, type Profile } from "../../../lib/auth";
import styles from "./page.module.css";

type ScheduleAssignment = {
  id: string;
  title: string;
  client_name: string | null;
  location: string | null;
  crew: string | null;
  assignment_date: string;
  assignment_time: string | null;
  status: string | null;
  notes: string | null;
};

type FormState = {
  title: string;
  client_name: string;
  location: string;
  crew: string;
  assignment_date: string;
  assignment_time: string;
  status: string;
  notes: string;
};

const emptyForm: FormState = {
  title: "",
  client_name: "",
  location: "",
  crew: "",
  assignment_date: "",
  assignment_time: "",
  status: "Scheduled",
  notes: "",
};

export default function ManageSchedulePage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<ScheduleAssignment[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function protectPage() {
      const currentProfile = await getCurrentProfile();

      if (!mounted) return;

      if (!currentProfile) {
        router.replace("/login");
        return;
      }

      if (isInstaller(currentProfile.role)) {
        router.replace("/installer/schedule");
        return;
      }

      setProfile(currentProfile);
      setCheckingAuth(false);
    }

    protectPage();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      void fetchAssignments();
    }
  }, [checkingAuth]);

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from("schedule_assignments")
      .select("*")
      .order("assignment_date", { ascending: true })
      .order("assignment_time", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((data as ScheduleAssignment[]) || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title.trim(),
      client_name: form.client_name.trim() || null,
      location: form.location.trim() || null,
      crew: form.crew.trim() || null,
      assignment_date: form.assignment_date,
      assignment_time: form.assignment_time.trim() || null,
      status: form.status.trim() || "Scheduled",
      notes: form.notes.trim() || null,
    };

    if (!payload.title || !payload.assignment_date) {
      setMessage("Title and assignment date are required.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("schedule_assignments")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Assignment updated.");
    } else {
      const { error } = await supabase
        .from("schedule_assignments")
        .insert([payload]);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Assignment created.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    await fetchAssignments();
  }

  function handleEdit(item: ScheduleAssignment) {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      client_name: item.client_name ?? "",
      location: item.location ?? "",
      crew: item.crew ?? "",
      assignment_date: item.assignment_date ?? "",
      assignment_time: item.assignment_time ?? "",
      status: item.status ?? "Scheduled",
      notes: item.notes ?? "",
    });
    setMessage(`Editing ${item.title}`);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("schedule_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (editingId === id) {
      handleCancelEdit();
    }

    setMessage("Assignment deleted.");
    await fetchAssignments();
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;

    return items.filter((item) =>
      [
        item.title,
        item.client_name ?? "",
        item.location ?? "",
        item.crew ?? "",
        item.assignment_date ?? "",
        item.assignment_time ?? "",
        item.status ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [items, search]);

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingCard}>Checking session...</div>
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
              <h2 className={styles.brandBottom}>Operations</h2>
            </div>
          </div>

          <nav className={styles.sideNav}>
            <Link href="/" className={styles.sideLink}>Home</Link>
            <Link href="/dashboard" className={styles.sideLink}>Dashboard</Link>
            <Link href="/jobs" className={styles.sideLink}>Jobs</Link>
            <Link href="/schedule" className={styles.sideLink}>Schedule</Link>
            <Link href="/schedule/manage" className={styles.sideLinkActive}>Manage Schedule</Link>
            <Link href="/configurator" className={styles.sideLink}>Configurator</Link>
          </nav>

          <div className={styles.sideFooter}>
            {profile?.email ? <p className={styles.userEmail}>Signed in as {profile.email}</p> : null}
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </aside>

        <section className={styles.main}>
          <header className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>ADMIN SCHEDULING</p>
              <h1 className={styles.title}>Manage Assignments</h1>
              <p className={styles.subtitle}>
                Create, update, and remove schedule assignments that appear on the admin and installer calendars.
              </p>
            </div>

            <div className={styles.topActions}>
              <Link href="/schedule" className={styles.primaryBtn}>Open Calendar</Link>
              <Link href="/installer/schedule" className={styles.secondaryBtn}>Installer View</Link>
            </div>
          </header>

          <section className={styles.contentGrid}>
            <div className={styles.formPanel}>
              <p className={styles.panelTag}>{editingId ? "Edit Assignment" : "New Assignment"}</p>
              <h3 className={styles.panelTitle}>
                {editingId ? "Update schedule item" : "Create schedule item"}
              </h3>

              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  className={styles.input}
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />

                <div className={styles.twoCol}>
                  <input
                    className={styles.input}
                    placeholder="Client name"
                    value={form.client_name}
                    onChange={(e) => updateField("client_name", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Crew"
                    value={form.crew}
                    onChange={(e) => updateField("crew", e.target.value)}
                  />
                </div>

                <input
                  className={styles.input}
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />

                <div className={styles.twoCol}>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.assignment_date}
                    onChange={(e) => updateField("assignment_date", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Time"
                    value={form.assignment_time}
                    onChange={(e) => updateField("assignment_time", e.target.value)}
                  />
                </div>

                <select
                  className={styles.input}
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>

                <textarea
                  className={styles.textarea}
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />

                {message ? <p className={styles.message}>{message}</p> : null}

                <div className={styles.formActions}>
                  <button className={styles.saveBtn} type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Assignment" : "Create Assignment"}
                  </button>

                  {editingId ? (
                    <button className={styles.cancelBtn} type="button" onClick={handleCancelEdit}>
                      Cancel Edit
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className={styles.listPanel}>
              <div className={styles.listHeader}>
                <div>
                  <p className={styles.panelTag}>Existing Assignments</p>
                  <h3 className={styles.panelTitle}>Current calendar items</h3>
                </div>

                <input
                  className={styles.searchInput}
                  placeholder="Search assignments"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className={styles.assignmentList}>
                {filteredItems.map((item) => (
                  <div key={item.id} className={styles.assignmentRow}>
                    <div className={styles.assignmentMain}>
                      <div className={styles.assignmentTitle}>{item.title}</div>
                      <div className={styles.assignmentMeta}>
                        {(item.assignment_date || "—")} • {(item.assignment_time || "—")} • {(item.client_name || "—")}
                      </div>
                      <div className={styles.assignmentSubMeta}>
                        {(item.location || "—")} • {(item.crew || "—")} • {(item.status || "—")}
                      </div>
                    </div>

                    <div className={styles.assignmentActions}>
                      <button className={styles.editBtn} onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {!filteredItems.length ? (
                  <p className={styles.emptyText}>No assignments found.</p>
                ) : null}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
