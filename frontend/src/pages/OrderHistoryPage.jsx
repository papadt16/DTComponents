import { useState, useEffect } from "react";

export default function OrderHistoryPage({ loadOrderIntoCart }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
    setOrders(history);
  }, []);

  if (!orders.length) return <h2 style={{ padding: 30 }}>No previous orders</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Order History</h2>
      {orders.map((order) => (
        <div key={order.id} style={orderCard}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.date}</p>
          <p><strong>Total:</strong> ₦{order.total.toLocaleString()}</p>
          <button
            style={loadBtn}
            onClick={() => loadOrderIntoCart(order.items)}
          >
            Load Order into Cart
          </button>
        </div>
      ))}
    </div>
  );
}

/* Styles */
const orderCard = {
  padding: 15,
  marginBottom: 20,
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "#f9fafb",
};

const loadBtn = {
  padding: "8px 16px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
