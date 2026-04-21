"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Invoice = {
  id: string;
  job_id: string;
  invoice_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  billing_address: string | null;
  project_address: string | null;
  status: string | null;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  total: number | null;
  amount_paid: number | null;
  balance_due: number | null;
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
};

type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
  sort_order?: number | null;
};

type InvoicePayment = {
  id: string;
  invoice_id: string;
  amount: number | null;
  payment_date: string | null;
  method: string | null;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
};

type Job = {
  id: string;
  customer: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  system_type: string | null;
  square_footage: number | null;
  value: number | null;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = Array.isArray(params?.invoiceId)
    ? params.invoiceId[0]
    : params?.invoiceId;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [status, setStatus] = useState("draft");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    void loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    setLoading(true);
    setMessage("");

    const invoiceRes = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceRes.error) {
      console.error(invoiceRes.error);
      setMessage(`Could not load invoice: ${invoiceRes.error.message}`);
      setLoading(false);
      return;
    }

    const loadedInvoice = invoiceRes.data as Invoice;
    setInvoice(loadedInvoice);

    setCustomerName(loadedInvoice.customer_name || "");
    setCustomerEmail(loadedInvoice.customer_email || "");
    setCustomerPhone(loadedInvoice.customer_phone || "");
    setBillingAddress(loadedInvoice.billing_address || "");
    setProjectAddress(loadedInvoice.project_address || "");
    setStatus(loadedInvoice.status || "draft");
    setIssueDate(loadedInvoice.issue_date || "");
    setDueDate(loadedInvoice.due_date || "");
    setNotes(loadedInvoice.notes || "");

    const [itemsRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", loadedInvoice.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("invoice_payments")
        .select("*")
        .eq("invoice_id", loadedInvoice.id)
        .order("payment_date", { ascending: false }),
    ]);

    if (itemsRes.error) {
      console.error(itemsRes.error);
      setItems([]);
    } else {
      setItems((itemsRes.data as InvoiceItem[]) || []);
    }

    if (paymentsRes.error) {
      console.error(paymentsRes.error);
      setPayments([]);
    } else {
      setPayments((paymentsRes.data as InvoicePayment[]) || []);
    }

    if (loadedInvoice.job_id) {
      const jobRes = await supabase
        .from("jobs")
        .select("id, customer, phone, email, location, system_type, square_footage, value")
        .eq("id", loadedInvoice.job_id)
        .single();

      if (!jobRes.error) {
        setJob(jobRes.data as Job);
      }
    }

    setLoading(false);
  }

  const computedSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  }, [items]);

  const computedTax = Number(invoice?.tax || 0);
  const computedDiscount = Number(invoice?.discount || 0);
  const computedTotal = computedSubtotal + computedTax - computedDiscount;
  const computedPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const computedBalance = computedTotal - computedPaid;

  function getAutoStatus(balance: number, paid: number, total: number) {
    if (total <= 0) return "draft";
    if (paid <= 0) return status === "draft" ? "draft" : "sent";
    if (balance <= 0) return "paid";
    return "partial";
  }

  async function saveInvoiceHeader() {
    if (!invoice) return;

    setSaving(true);
    setMessage("");

    const total = computedTotal;
    const amountPaid = computedPaid;
    const balanceDue = computedBalance;
    const nextStatus = getAutoStatus(balanceDue, amountPaid, total);

    const { error } = await supabase
      .from("invoices")
      .update({
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        billing_address: billingAddress || null,
        project_address: projectAddress || null,
        status: nextStatus,
        issue_date: issueDate || null,
        due_date: dueDate || null,
        notes: notes || null,
        subtotal: computedSubtotal,
        total,
        amount_paid: amountPaid,
        balance_due: balanceDue,
      })
      .eq("id", invoice.id);

    if (error) {
      console.error(error);
      setMessage(`Could not save invoice: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Invoice saved.");
    setSaving(false);
    await loadInvoice();
  }

  async function addLineItem() {
    if (!invoice) return;

    const payload = {
      invoice_id: invoice.id,
      description: "New line item",
      quantity: 1,
      unit_price: 0,
      line_total: 0,
      sort_order: items.length + 1,
    };

    const { error } = await supabase.from("invoice_items").insert([payload]);

    if (error) {
      console.error(error);
      setMessage(`Could not add line item: ${error.message}`);
      return;
    }

    await loadInvoice();
  }

  async function updateLineItem(itemId: string, changes: Partial<InvoiceItem>) {
    const current = items.find((item) => item.id === itemId);
    if (!current) return;

    const quantity =
      changes.quantity !== undefined
        ? Number(changes.quantity || 0)
        : Number(current.quantity || 0);

    const unitPrice =
      changes.unit_price !== undefined
        ? Number(changes.unit_price || 0)
        : Number(current.unit_price || 0);

    const lineTotal = quantity * unitPrice;

    const { error } = await supabase
      .from("invoice_items")
      .update({
        ...changes,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      })
      .eq("id", itemId);

    if (error) {
      console.error(error);
      setMessage(`Could not update line item: ${error.message}`);
      return;
    }

    await loadInvoice();
  }

  async function deleteLineItem(itemId: string) {
    const { error } = await supabase
      .from("invoice_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error(error);
      setMessage(`Could not delete line item: ${error.message}`);
      return;
    }

    await loadInvoice();
  }

  async function addPayment() {
    if (!invoice) return;

    const amount = Number(paymentAmount || 0);

    if (amount <= 0) {
      setMessage("Payment amount must be greater than 0.");
      return;
    }

    setAddingPayment(true);
    setMessage("");

    const paymentInsert = await supabase.from("invoice_payments").insert([
      {
        invoice_id: invoice.id,
        amount,
        payment_date: paymentDate || new Date().toISOString().split("T")[0],
        method: paymentMethod || null,
        reference_number: paymentReference || null,
        notes: paymentNotes || null,
      },
    ]);

    if (paymentInsert.error) {
      console.error(paymentInsert.error);
      setMessage(`Could not add payment: ${paymentInsert.error.message}`);
      setAddingPayment(false);
      return;
    }

    const nextPaid = computedPaid + amount;
    const nextBalance = computedTotal - nextPaid;
    const nextStatus = nextBalance <= 0 ? "paid" : "partial";

    const invoiceUpdate = await supabase
      .from("invoices")
      .update({
        amount_paid: nextPaid,
        balance_due: nextBalance,
        status: nextStatus,
        subtotal: computedSubtotal,
        total: computedTotal,
      })
      .eq("id", invoice.id);

    if (invoiceUpdate.error) {
      console.error(invoiceUpdate.error);
      setMessage(`Payment saved, but invoice update failed: ${invoiceUpdate.error.message}`);
      setAddingPayment(false);
      await loadInvoice();
      return;
    }

    const financeInsert = await supabase.from("financial_entries").insert([
      {
        entry_type: "income",
        category: "invoice_payment",
        source_type: "invoice",
        source_id: invoice.id,
        job_id: invoice.job_id || null,
        invoice_id: invoice.id,
        title: `Payment for ${invoice.invoice_number || "Invoice"}`,
        description:
          paymentNotes ||
          `Payment recorded by ${paymentMethod || "payment"} on ${paymentDate || new Date().toISOString().split("T")[0]}`,
        amount,
        entry_date: paymentDate || new Date().toISOString().split("T")[0],
      },
    ]);

    if (financeInsert.error) {
      console.error(financeInsert.error);
      setMessage(`Payment added, but finance entry failed: ${financeInsert.error.message}`);
      setAddingPayment(false);
      await loadInvoice();
      return;
    }

    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("cash");
    setPaymentReference("");
    setPaymentNotes("");
    setAddingPayment(false);
    setMessage("Payment recorded.");
    await loadInvoice();
  }

  if (loading) {
    return <main style={pageStyle}>Loading invoice...</main>;
  }

  if (!invoice) {
    return <main style={pageStyle}>Invoice not found.</main>;
  }

  return (
    <main style={pageStyle}>
      <div style={topActionsStyle}>
        <Link href="/dashboard/jobs" style={ghostLinkStyle}>
          Back to Jobs
        </Link>

        <div style={topButtonGroupStyle}>
          <button type="button" style={ghostButtonStyle} onClick={() => window.print()}>
            Print Invoice
          </button>
          <button
            type="button"
            style={primaryButtonStyle}
            onClick={saveInvoiceHeader}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>

      {message ? <div style={messageStyle}>{message}</div> : null}

      <section style={sheetStyle}>
        <div style={sheetHeaderStyle}>
          <div>
            <div style={brandStyle}>ARTIPOXI</div>
            <div style={subBrandStyle}>Invoice</div>
          </div>

          <div style={invoiceMetaWrapStyle}>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Invoice #</span>
              <span style={metaValueStyle}>{invoice.invoice_number || "Draft"}</span>
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={selectInlineStyle}
              >
                <option value="draft">draft</option>
                <option value="sent">sent</option>
                <option value="paid">paid</option>
                <option value="partial">partial</option>
                <option value="overdue">overdue</option>
                <option value="void">void</option>
              </select>
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Issue Date</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                style={inputInlineStyle}
              />
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputInlineStyle}
              />
            </div>
          </div>
        </div>

        <div style={addressGridStyle}>
          <div style={addressCardStyle}>
            <div style={sectionLabelStyle}>Bill To</div>
            <input
              style={inputStyle}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
            <input
              style={inputStyle}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Customer email"
            />
            <input
              style={inputStyle}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Customer phone"
            />
            <textarea
              style={textareaStyle}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Billing address"
            />
          </div>

          <div style={addressCardStyle}>
            <div style={sectionLabelStyle}>Project</div>
            <textarea
              style={textareaStyle}
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="Project address"
            />
            <div style={jobSummaryStyle}>
              <div><strong>Job ID:</strong> {job?.id || invoice.job_id}</div>
              <div><strong>System:</strong> {job?.system_type || "—"}</div>
              <div><strong>Square Footage:</strong> {job?.square_footage ?? "—"}</div>
            </div>
          </div>
        </div>

        <div style={lineItemsHeaderStyle}>
          <div style={sectionLabelStyle}>Line Items</div>
          <button type="button" style={ghostButtonStyle} onClick={addLineItem}>
            Add Line Item
          </button>
        </div>

        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyleLeft}>Description</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Unit Price</th>
                <th style={thStyle}>Line Total</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={emptyCellStyle}>
                    No line items yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyleLeft}>
                      <input
                        style={tableInputStyle}
                        value={item.description || ""}
                        onChange={(e) =>
                          updateLineItem(item.id, { description: e.target.value })
                        }
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        style={tableInputStyle}
                        value={item.quantity ?? 0}
                        onChange={(e) =>
                          updateLineItem(item.id, { quantity: Number(e.target.value || 0) })
                        }
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        style={tableInputStyle}
                        value={item.unit_price ?? 0}
                        onChange={(e) =>
                          updateLineItem(item.id, { unit_price: Number(e.target.value || 0) })
                        }
                      />
                    </td>
                    <td style={tdStyle}>
                      ${Number(item.line_total || 0).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={deleteButtonStyle}
                        onClick={() => deleteLineItem(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={paymentSectionStyle}>
          <div style={paymentHeaderStyle}>
            <div style={sectionLabelStyle}>Payments</div>
          </div>

          <div style={paymentFormGridStyle}>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Payment amount"
              style={inputStyleNoMargin}
            />
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              style={inputStyleNoMargin}
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={inputStyleNoMargin}
            >
              <option value="cash">cash</option>
              <option value="card">card</option>
              <option value="check">check</option>
              <option value="transfer">transfer</option>
            </select>
            <input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Reference #"
              style={inputStyleNoMargin}
            />
            <input
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Payment note"
              style={{ ...inputStyleNoMargin, gridColumn: "span 2" }}
            />
          </div>

          <div style={paymentButtonRowStyle}>
            <button
              type="button"
              style={primaryButtonStyle}
              onClick={addPayment}
              disabled={addingPayment}
            >
              {addingPayment ? "Adding..." : "Add Payment"}
            </button>
          </div>

          <div style={paymentHistoryWrapStyle}>
            {payments.length === 0 ? (
              <div style={notesTextStyle}>No payments recorded yet.</div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} style={paymentRowStyle}>
                  <div>
                    <div style={paymentTitleStyle}>
                      ${Number(payment.amount || 0).toLocaleString()}
                    </div>
                    <div style={paymentMetaStyle}>
                      {(payment.method || "payment").toUpperCase()} •{" "}
                      {formatDate(payment.payment_date)}
                      {payment.reference_number ? ` • Ref ${payment.reference_number}` : ""}
                    </div>
                  </div>
                  <div style={paymentMetaStyle}>{payment.notes || ""}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={bottomGridStyle}>
          <div style={notesCardStyle}>
            <div style={sectionLabelStyle}>Notes</div>
            <textarea
              style={notesTextareaStyle}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice notes"
            />
          </div>

          <div style={totalsCardStyle}>
            <div style={totalRowStyle}>
              <span>Subtotal</span>
              <strong>${computedSubtotal.toLocaleString()}</strong>
            </div>
            <div style={totalRowStyle}>
              <span>Tax</span>
              <strong>${computedTax.toLocaleString()}</strong>
            </div>
            <div style={totalRowStyle}>
              <span>Discount</span>
              <strong>${computedDiscount.toLocaleString()}</strong>
            </div>
            <div style={totalRowStrongStyle}>
              <span>Total</span>
              <strong>${computedTotal.toLocaleString()}</strong>
            </div>
            <div style={totalRowStyle}>
              <span>Paid</span>
              <strong>${computedPaid.toLocaleString()}</strong>
            </div>
            <div style={totalRowStrongStyle}>
              <span>Balance Due</span>
              <strong>${computedBalance.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0b1220",
  color: "white",
  padding: "20px",
};

const topActionsStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const topButtonGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const ghostLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const ghostButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};

const deleteButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,80,80,0.18)",
  borderRadius: "10px",
  padding: "8px 10px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#ffd3d3",
  background: "rgba(255,80,80,0.1)",
};

const messageStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 16px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(0,198,255,0.08)",
  border: "1px solid rgba(0,198,255,0.18)",
  color: "#9fe8ff",
};

const sheetStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  background: "white",
  color: "#111827",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
};

const sheetHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "24px",
};

const brandStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 900,
  letterSpacing: "0.04em",
};

const subBrandStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "16px",
  color: "#4b5563",
};

const invoiceMetaWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
  minWidth: "320px",
};

const metaRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  alignItems: "center",
  gap: "10px",
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  fontWeight: 700,
};

const metaValueStyle: React.CSSProperties = {
  fontWeight: 700,
};

const inputInlineStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const selectInlineStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const addressGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "22px",
};

const addressCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "14px",
  background: "#f9fafb",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "#6b7280",
  marginBottom: "10px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginBottom: "10px",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const inputStyleNoMargin: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "92px",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  resize: "vertical",
};

const jobSummaryStyle: React.CSSProperties = {
  marginTop: "12px",
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#374151",
};

const lineItemsHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "760px",
};

const thStyleLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
};

const thStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "12px",
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
};

const tdStyleLeft: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #f3f4f6",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #f3f4f6",
  textAlign: "center",
};

const tableInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
};

const emptyCellStyle: React.CSSProperties = {
  padding: "18px",
  textAlign: "center",
  color: "#6b7280",
};

const paymentSectionStyle: React.CSSProperties = {
  marginTop: "20px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "14px",
  background: "#f9fafb",
};

const paymentHeaderStyle: React.CSSProperties = {
  marginBottom: "10px",
};

const paymentFormGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const paymentButtonRowStyle: React.CSSProperties = {
  marginTop: "12px",
  display: "flex",
  justifyContent: "flex-end",
};

const paymentHistoryWrapStyle: React.CSSProperties = {
  marginTop: "16px",
  display: "grid",
  gap: "10px",
};

const paymentRowStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  background: "white",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap",
};

const paymentTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
};

const paymentMetaStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
};

const bottomGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "16px",
  marginTop: "20px",
};

const notesCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "14px",
  background: "#f9fafb",
};

const notesTextStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "14px",
  padding: "8px 0",
};

const notesTextareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "140px",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  resize: "vertical",
};

const totalsCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "14px",
  background: "#f9fafb",
  display: "grid",
  gap: "10px",
  alignContent: "start",
};

const totalRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  fontSize: "15px",
};

const totalRowStrongStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  fontSize: "17px",
  fontWeight: 800,
  paddingTop: "8px",
  borderTop: "1px solid #e5e7eb",
};
