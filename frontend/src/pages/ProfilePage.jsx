import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn, getCustomerToken, setCustomerSession, clearCustomerSession } from "../utils/auth.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login?redirect=/profile");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: authHeaders() });
      setEmail(res.data.email || "");
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        city: res.data.city || "",
        state: res.data.state || "",
      });
    } catch {
      setError("Couldn't load your profile. Try refreshing the page.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await axios.put(`${API}/auth/me`, form, { headers: authHeaders() });
      // Keep the cached session profile (used for greetings etc.) in sync too.
      setCustomerSession(getCustomerToken(), { name: res.data.name, email: res.data.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearCustomerSession();
    navigate("/");
  }

  if (loading) return <div className="container section">Loading…</div>;

  return (
    <div className="container section" style={{ maxWidth: "480px" }}>
      <h2 className="section-title" style={{ marginBottom: "8px" }}>Your profile</h2>
      <p className="section-sub" style={{ marginBottom: "28px" }}>
        Saved here is used to fill in your delivery details automatically on BOQ PDFs.
      </p>

      <form onSubmit={handleSave}>
        <label className="field-label">Email</label>
        <input className="field-input" value={email} disabled style={{ opacity: 0.6 }} />

        <label className="field-label">Full name</label>
        <input
          className="field-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="field-label">Phone number</label>
        <input
          className="field-input"
          placeholder="e.g. 0803 123 4567"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label className="field-label">Delivery address</label>
        <input
          className="field-input"
          placeholder="Street address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label className="field-label">City</label>
            <input
              className="field-input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="field-label">State</label>
            <input
              className="field-input"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
        </div>

        {error && <p style={{ color: "var(--danger)", fontSize: "14px", marginBottom: "12px" }}>{error}</p>}
        {saved && <p style={{ color: "var(--signal-dark)", fontSize: "14px", marginBottom: "12px" }}>Saved.</p>}

        <button className="btn btn-primary btn-block" disabled={saving} style={{ marginTop: "8px" }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
        <button className="btn btn-secondary btn-block" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
