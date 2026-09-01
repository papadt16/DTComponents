import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";
import AdminGate from "../components/AdminGate.jsx";
import AdminShell from "../components/AdminShell.jsx";

function emptyPromo() {
  return {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderTotal: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    featured: false,
    active: true,
  };
}

export default function AdminPromotions() {
  return (
    <AdminGate>
      <AdminShell title="Promotions">
        <PromotionsPanel />
      </AdminShell>
    </AdminGate>
  );
}

function PromotionsPanel() {
  const token = localStorage.getItem("dt_token");
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPromo());
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await axios.get(`${API}/promotions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPromos(res.data);
    setLoading(false);
  }

  async function save() {
    setError("");
    if (!form.code || !form.discountValue) {
      setError("Code and discount value are required.");
      return;
    }
    try {
      await axios.post(`${API}/promotions`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(emptyPromo());
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't save that promotion.");
    }
  }

  async function toggle(promo, field) {
    await axios.put(
      `${API}/promotions/${promo._id}`,
      { [field]: !promo[field] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  }

  async function remove(id) {
    if (!window.confirm("Delete this promotion?")) return;
    await axios.delete(`${API}/promotions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  return (
    <>
      <div className="admin-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Discount codes</strong>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "+ New promotion"}
          </button>
        </div>

        {showForm && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div className="admin-form-grid">
              <input placeholder="Code (e.g. WELCOME10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off (₦)</option>
              </select>
              <input
                type="number"
                placeholder={form.discountType === "percentage" ? "e.g. 10 (for 10%)" : "e.g. 2000"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Min order total (₦, optional)"
                value={form.minOrderTotal}
                onChange={(e) => setForm({ ...form, minOrderTotal: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Usage limit (0 = unlimited)"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>

            <div className="admin-form-grid" style={{ marginTop: "12px" }}>
              <div>
                <label className="field-label">Start date (optional)</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="field-label">End date (optional)</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <input
              placeholder="Description (shown on homepage banner if featured)"
              className="field-input"
              style={{ marginTop: "12px" }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", marginBottom: "12px" }}>
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Feature this as the homepage banner
            </label>

            {error && <p style={{ color: "var(--danger)", fontSize: "14px", marginBottom: "12px" }}>{error}</p>}
            <button className="btn btn-primary" onClick={save}>Save promotion</button>
          </div>
        )}
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading…</p>
        ) : promos.length === 0 ? (
          <p style={{ padding: "20px" }}>No promotions yet. Create one above.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Window</th>
                <th>Featured</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.code}</strong></td>
                  <td>{p.discountType === "percentage" ? `${p.discountValue}%` : `₦${p.discountValue.toLocaleString()}`}</td>
                  <td>{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                  <td style={{ fontSize: "13px" }}>
                    {p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"} to{" "}
                    {p.endDate ? new Date(p.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggle(p, "featured")}>
                      {p.featured ? "Yes" : "No"}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggle(p, "active")}>
                      {p.active ? "Yes" : "No"}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
