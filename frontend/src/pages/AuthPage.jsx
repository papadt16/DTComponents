import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { setCustomerSession } from "../utils/auth.js";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await axios.post(`${API}${endpoint}`, payload);
      setCustomerSession(res.data.token, { name: res.data.name, email: res.data.email });
      navigate(redirectTo);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: "420px" }}>
      <h2 className="section-title" style={{ marginBottom: "8px" }}>
        {isRegister ? "Create an account" : "Sign in"}
      </h2>
      <p className="section-sub" style={{ marginBottom: "28px" }}>
        {isRegister
          ? "Save a wishlist and check out faster next time."
          : "Welcome back."}
      </p>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <label className="field-label">Name</label>
            <input
              className="field-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </>
        )}

        <label className="field-label">Email</label>
        <input
          type="email"
          required
          className="field-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label className="field-label">Password</label>
        <input
          type="password"
          required
          minLength={isRegister ? 8 : undefined}
          className="field-input"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p style={{ color: "var(--danger)", fontSize: "14px", marginBottom: "16px" }}>{error}</p>}

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: "20px", fontSize: "14px" }}>
        {isRegister ? (
          <>Already have an account? <Link to="/login" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>Sign in</Link></>
        ) : (
          <>New here? <Link to="/register" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>Create an account</Link></>
        )}
      </p>
    </div>
  );
}
