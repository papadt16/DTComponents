import { useState } from "react";
import axios from "axios";
import API from "../utils/api.js";

export default function AdminGate({ children }) {
  const [token, setToken] = useState(localStorage.getItem("dt_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, login);
      localStorage.setItem("dt_token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-panel">
          <div className="brand" style={{ marginBottom: "24px", color: "var(--text-on-dark)" }}>
            <span className="brand-mark" />
            DTComponents console
          </div>
          <label className="field-label" style={{ color: "var(--text-on-dark-muted)" }}>Username</label>
          <input
            className="field-input"
            onChange={(e) => setLogin({ ...login, username: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <label className="field-label" style={{ color: "var(--text-on-dark-muted)" }}>Password</label>
          <input
            type="password"
            className="field-input"
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p style={{ color: "#ff9d8a", marginBottom: "16px", fontSize: "14px" }}>{error}</p>}
          <button className="btn btn-primary btn-block" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
