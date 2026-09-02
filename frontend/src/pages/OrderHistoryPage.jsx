import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderHistoryPage({ loadOrderIntoCart }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local"); // "account" | "local"
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    if (isLoggedIn()) {
      try {
        const res = await axios.get(`${API}/orders`, { headers: authHeaders() });
        setOrders(
          res.data.map((o) => ({
            id: o._id,
            date: new Date(o.createdAt).toLocaleString(),
            items: o.items,
            subtotal: o.subtotal,
            discountCode: o.discountCode,
            discountAmount: o.discountAmount,
            total: o.total,
            status: o.status,
          }))
        );
        setSource("account");
        setLoading(false);
        return;
      } catch {
        // fall through to local history
      }
    }

    const history = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
    setOrders(history);
    setSource("local");
    setLoading(false);
  }

  const handleReorder = (items) => {
    loadOrderIntoCart(items.map((item) => ({ ...item })));
    navigate("/cart");
  };

  if (loading) return <div className="container section">Loading…</div>;

  if (!orders.length) {
    return (
      <div className="container section">
        <h2 className="section-title">No previous orders</h2>
        {!isLoggedIn() && (
          <p style={{ marginTop: "12px", fontSize: "14px" }}>
            <a href="/login" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>Sign in</a> to keep a permanent order history across devices.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h2 className="section-title">Order history</h2>
          <p className="section-sub">
            {source === "account" ? "Synced to your account" : "Stored on this device only"}
          </p>
        </div>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="cart-item" style={{ alignItems: "flex-start", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Order #{String(order.id).slice(-6)}</p>
              <p style={{ margin: "2px 0 0", fontSize: "13px" }}>{order.date}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {order.discountAmount > 0 && (
                <p style={{ margin: 0, fontSize: "13px", color: "var(--signal-dark)" }}>
                  {order.discountCode ? `${order.discountCode}: ` : "Discount: "}
                  −₦{order.discountAmount.toLocaleString()}
                </p>
              )}
              <p style={{ margin: 0, fontWeight: 600 }}>₦{order.total.toLocaleString()}</p>
              {order.status && (
                <span className="badge badge-new" style={{ marginTop: "4px", display: "inline-block" }}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
              View details
            </button>
            <button className="btn btn-dark btn-sm" onClick={() => handleReorder(order.items)}>
              Reorder
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
