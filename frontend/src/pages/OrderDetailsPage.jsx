import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const WHATSAPP_NUMBER = "2349038899075";

export default function OrderDetailsPage({ loadOrderIntoCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
    const found = history.find((o) => o.id === parseInt(id));
    setOrder(found || null);
  }, [id]);

  if (!order) return <h2 style={{ padding: 30 }}>Order not found</h2>;

  const total = () => order.items.reduce((s, p) => s + p.price * p.qty, 0);

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DTComponents", 105, 15, { align: "center" });
    doc.setFontSize(11);
    doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Date: ${order.date}`, 14, 30);

    let y = 40;
    doc.setFontSize(10);
    doc.text("S/N", 14, y);
    doc.text("Description", 25, y);
    doc.text("Qty", 130, y);
    doc.text("Unit (₦)", 145, y);
    doc.text("Amount (₦)", 170, y);

    y += 6;
    doc.line(14, y, 195, y);
    y += 6;

    order.items.forEach((item, index) => {
      doc.text(String(index + 1), 14, y);
      doc.text(item.title, 25, y);
      doc.text(String(item.qty), 130, y);
      doc.text(item.price.toLocaleString(), 145, y);
      doc.text((item.qty * item.price).toLocaleString(), 170, y);
      y += 7;
    });

    y += 4;
    doc.line(14, y, 195, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`Grand Total: ₦${total().toLocaleString()}`, 195, y, { align: "right" });

    doc.save(`Order_${order.id}_BOQ.pdf`);
  };

  const sendWhatsApp = () => {
    let msg = `Hello DTComponents,%0A%0APlease find my BOQ attached.%0A%0AOrder Summary:%0A`;
    order.items.forEach((p) => {
      msg += `- ${p.qty} x ${p.title}%0A`;
    });
    msg += `%0AGrand Total: ₦${total().toLocaleString()}%0A%0AThank you.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Order #{order.id}</h2>
      <p><strong>Date:</strong> {order.date}</p>

      {order.items.map((item, index) => (
        <div key={index} style={itemCard}>
          <p>{item.title}</p>
          <p>Qty: {item.qty}</p>
          <p>Unit: ₦{item.price.toLocaleString()}</p>
          <p>Subtotal: ₦{(item.qty * item.price).toLocaleString()}</p>
        </div>
      ))}

      <h3>Grand Total: ₦{total().toLocaleString()}</h3>

      <button style={btn} onClick={() => loadOrderIntoCart(order.items)}>🔁 Reorder</button>
      <button style={btn} onClick={generatePdf}>📄 Download BOQ</button>
      <button style={btn} onClick={sendWhatsApp}>📤 Send to WhatsApp</button>
      <button style={btnBack} onClick={() => navigate("/orders")}>⬅ Back to History</button>
    </div>
  );
}

/* Styles */
const itemCard = {
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 6,
  marginBottom: 10,
  background: "#f1f5f9",
};

const btn = {
  padding: "10px 16px",
  marginRight: 10,
  marginTop: 10,
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const btnBack = {
  ...btn,
  background: "#2563eb",
};
