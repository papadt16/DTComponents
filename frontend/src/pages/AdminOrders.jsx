import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";
import AdminGate from "../components/AdminGate.jsx";
import AdminShell from "../components/AdminShell.jsx";

const STATUSES = ["pending", "confirmed", "shipped", "completed", "cancelled"];

export default function AdminOrders() {
  return (
    <AdminGate>
      <AdminShell title="Orders">
        <OrdersPanel />
      </AdminShell>
    </AdminGate>
  );
}

function OrdersPanel() {
  const token = localStorage.getItem("dt_token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      await axios.put(
        `${API}/orders/admin/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } finally {
      setUpdatingId(null);
    }
  }

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <div className="admin-stat-row">
        <div className="admin-stat">
          <div className="admin-stat-value">{orders.length}</div>
          <div className="admin-stat-label">Total orders</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{orders.filter((o) => o.status === "pending").length}</div>
          <div className="admin-stat-label">Pending</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">₦{revenue.toLocaleString()}</div>
          <div className="admin-stat-label">Revenue (excl. cancelled)</div>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <p style={{ padding: "20px" }}>No orders placed yet. Only logged-in customers' checkouts are saved here — guest checkouts still work but only appear as WhatsApp/PDF, not in this table.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6)}</td>
                  <td>{o.customer?.email || "Guest"}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.reduce((s, i) => s + i.qty, 0)} pcs</td>
                  <td>₦{(o.subtotal ?? o.total).toLocaleString()}</td>
                  <td>
                    {o.discountAmount > 0 ? (
                      <span style={{ color: "var(--signal-dark)" }}>
                        −₦{o.discountAmount.toLocaleString()}{o.discountCode ? ` (${o.discountCode})` : ""}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>₦{o.total.toLocaleString()}</td>
                  <td>
                    <select
                      value={o.status}
                      disabled={updatingId === o._id}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
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
