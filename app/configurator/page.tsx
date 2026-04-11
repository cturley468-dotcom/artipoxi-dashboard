"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { supabase } from "../lib/supabase";

type SavedQuote = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  project_name: string | null;
  square_feet: number | null;
  coating_type: string | null;
  prep_level: string | null;
  extras: string[] | null;
  coating_cost: number | null;
  prep_cost: number | null;
  extras_cost: number | null;
  total_estimate: number | null;
};

export default function ConfiguratorPage() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [sqft, setSqft] = useState(500);
  const [coating, setCoating] = useState("standard");
  const [prep, setPrep] = useState("light");
  const [extras, setExtras] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [message, setMessage] = useState("");
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);

  const basePricePerSqft = {
    standard: 6,
    premium: 8,
    metallic: 10,
  };

  const prepCostMap = {
    light: 0,
    medium: 500,
    heavy: 1200,
  };

  const extraOptions = [
    { id: "crack", label: "Crack Repair", price: 300 },
    { id: "moisture", label: "Moisture Barrier", price: 600 },
    { id: "uv", label: "UV Stable Topcoat", price: 400 },
  ];

  useEffect(() => {
    async function loadQuote() {
      if (!quoteId) return;

      setLoadingQuote(true);
      setMessage("");

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .single();

      if (error) {
        setMessage(error.message);
        setLoadingQuote(false);
        return;
      }

      const quote = data as SavedQuote;

      setSavedQuote(quote);
      setCustomerName(quote.customer_name || "");
      setCustomerEmail(quote.customer_email || "");
      setProjectName(quote.project_name || "");
      setSqft(quote.square_feet || 0);
      setCoating(quote.coating_type || "standard");
      setPrep(quote.prep_level || "light");
      setExtras(quote.extras || []);
      setMessage("Loaded saved quote.");
      setLoadingQuote(false);
    }

    loadQuote();
  }, [quoteId]);

  function toggleExtra(id: string) {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  const coatingCost = useMemo(
    () => sqft * basePricePerSqft[coating as keyof typeof basePricePerSqft],
    [sqft, coating]
  );

  const extrasTotal = useMemo(
    () =>
      extraOptions
        .filter((e) => extras.includes(e.id))
        .reduce((sum, e) => sum + e.price, 0),
    [extras]
  );

  const prepCost = prepCostMap[prep as keyof typeof prepCostMap];
  const total = coatingCost + prepCost + extrasTotal;

  async function handleSaveQuote() {
    setSaving(true);
    setMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload = {
        user_id: userData.user?.id ?? null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        project_name: projectName || null,
        square_feet: sqft,
        coating_type: coating,
        prep_level: prep,
        extras,
        coating_cost: coatingCost,
        prep_cost: prepCost,
        extras_cost: extrasTotal,
        total_estimate: total,
      };

      if (savedQuote?.id) {
        const { data, error } = await supabase
          .from("quotes")
          .update(payload)
          .eq("id", savedQuote.id)
          .select("*")
          .single();

        if (error) {
          setMessage(error.message);
          setSaving(false);
          return;
        }

        setSavedQuote(data as SavedQuote);
        setMessage("Quote updated successfully.");
      } else {
        const { data, error } = await supabase
          .from("quotes")
          .insert([{ ...payload, status: "draft" }])
          .select("*")
          .single();

        if (error) {
          setMessage(error.message);
          setSaving(false);
          return;
        }

        setSavedQuote(data as SavedQuote);
        setMessage("Quote saved successfully.");
      }
    } catch {
      setMessage("Unexpected error saving quote.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConvertToJob() {
    if (!savedQuote?.id) {
      setMessage("Save the quote first.");
      return;
    }

    setConverting(true);
    setMessage("");

    try {
      const { error } = await supabase.from("jobs").insert([
        {
          quote_id: savedQuote.id,
          title: projectName || "New Quote Job",
          client_name: customerName || "Unknown Client",
          client_email: customerEmail || null,
          status: "open",
          price: total || 0,
          notes: `Created from quote ${savedQuote.id}`,
        },
      ]);

      if (error) {
        setMessage(error.message);
        setConverting(false);
        return;
      }

      await supabase
        .from("quotes")
        .update({ status: "converted" })
        .eq("id", savedQuote.id);

      setMessage("Quote converted to job.");
    } catch {
      setMessage("Unexpected error converting quote.");
    } finally {
      setConverting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>ARTIPOXI</p>
          <h1 className={styles.title}>Floor Configurator</h1>
          <p className={styles.subtitle}>
            Build accurate quotes fast and save them directly into your system.
          </p>
        </header>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>Customer + Project</h2>

            <label className={styles.label}>
              Customer Name
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Customer Email
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Project Name
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={styles.input}
              />
            </label>

            <h2 className={styles.sectionTitle}>Project Details</h2>

            <label className={styles.label}>
              Square Footage
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Coating Type
              <select
                value={coating}
                onChange={(e) => setCoating(e.target.value)}
                className={styles.select}
              >
                <option value="standard">Standard Flake</option>
                <option value="premium">Premium Flake</option>
                <option value="metallic">Metallic Epoxy</option>
              </select>
            </label>

            <label className={styles.label}>
              Surface Prep
              <select
                value={prep}
                onChange={(e) => setPrep(e.target.value)}
                className={styles.select}
              >
                <option value="light">Light Prep</option>
                <option value="medium">Medium Grind</option>
                <option value="heavy">Heavy Prep / Repair</option>
              </select>
            </label>

            <div className={styles.extras}>
              <p className={styles.subLabel}>Extras</p>

              {extraOptions.map((extra) => (
                <label key={extra.id} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={extras.includes(extra.id)}
                    onChange={() => toggleExtra(extra.id)}
                  />
                  {extra.label} (+${extra.price})
                </label>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>Estimate Summary</h2>

            {loadingQuote ? <p className={styles.message}>Loading quote...</p> : null}
            {message ? <p className={styles.message}>{message}</p> : null}

            <div className={styles.summaryRow}>
              <span>Coating Cost</span>
              <strong>${coatingCost.toLocaleString()}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Prep</span>
              <strong>${prepCost.toLocaleString()}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Extras</span>
              <strong>${extrasTotal.toLocaleString()}</strong>
            </div>

            <div className={styles.total}>
              <span>Total Estimate</span>
              <strong>${total.toLocaleString()}</strong>
            </div>

            {savedQuote ? (
              <div className={styles.savedBox}>
                <div className={styles.savedTitle}>Saved Quote</div>
                <div className={styles.savedText}>ID: {savedQuote.id}</div>
                <div className={styles.savedText}>Customer: {customerName || "No name"}</div>
                <div className={styles.savedText}>Project: {projectName || "No project name"}</div>
              </div>
            ) : null}

            <button className={styles.primaryBtn} onClick={handleSaveQuote} disabled={saving}>
              {saving ? "Saving Quote..." : savedQuote ? "Update Quote" : "Save Quote"}
            </button>

            <button className={styles.secondaryBtn} onClick={handleConvertToJob} disabled={converting}>
              {converting ? "Converting..." : "Convert to Job"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
