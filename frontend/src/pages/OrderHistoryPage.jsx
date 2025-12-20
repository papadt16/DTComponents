import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderHistoryPage({ loadOrderIntoCart }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const history = JSON.parse(
      localStorage.getItem("dt_order_history") || "[]"
    );
    setOrders(history);
  }, []);

  if (!orders.length) {
    return <h2 style={{ padding: 30 }}>No previous orders</h2>;
  }

  const handleReorder = (items) => {
    const clonedItems = items.map((item) => ({ ...item }));
    loadOrderIntoCart(clonedItems); // <-- update App.jsx cart state
    navigate("/cart"); // go to cart
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Order History</h2>

      {orders.map((order) => (
        <div key={order.id} style={orderCard}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.date}</p>
          <p><strong>Total:</strong> ₦{order.total.toLocaleString()}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={viewBtn}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              View Details
            </button>

            <button
              style={reorderBtn}
              onClick={() => handleReorder(order.items)}
            >
              🔁 Reorder
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== STYLES ===== */
const orderCard = {
  padding: 15,
  marginBottom: 20,
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "#f9fafb",
};

const viewBtn = {
  padding: "8px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const reorderBtn = {
  padding: "8px 16px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
