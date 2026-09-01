import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

const WHATSAPP_NUMBER = "2349038899075";
const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function isObjectId(id) {
  return /^[a-f0-9]{24}$/i.test(id);
}

export default function OrderDetailsPage({ loadOrderIntoCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (isLoggedIn() && isObjectId(id)) {
      try {
        const res = await axios.get(`${API}/orders/${id}`, { headers: authHeaders() });
        setOrder({
          id: res.data._id,
          date: new Date(res.data.createdAt).toLocaleString(),
          items: res.data.items,
          total: res.data.total,
          status: res.data.status,
        });
        return;
      } catch {
        // fall through to local lookup
      }
    }

    const history = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
    const found = history.find((o) => String(o.id) === String(id));
    if (found) setOrder(found);
    else setNotFound(true);
  }

  if (notFound) return <h2 className="container section">Order not found</h2>;
  if (!order) return <div className="container section">Loading…</div>;

  const total = () => order.total ?? order.items.reduce((s, p) => s + p.price * p.qty, 0);

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DTComponents", 105, 15, { align: "center" });
    doc.setFontSize(11);
    doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Date: ${order.date}`, 14, 30);

    let y = 40;
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
    <div className="container section">
      <div className="section-head">
        <div>
          <h2 className="section-title">Order #{String(order.id).slice(-6)}</h2>
          <p className="section-sub">{order.date}</p>
        </div>
        {order.status && (
          <span className="badge badge-new">{STATUS_LABEL[order.status] || order.status}</span>
        )}
      </div>

      {order.items.map((item, index) => (
        <div key={index} className="cart-item">
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{item.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: "13px" }}>
              Qty {item.qty} · ₦{item.price.toLocaleString()} each
            </p>
          </div>
          <p style={{ margin: 0, fontWeight: 600 }}>₦{(item.qty * item.price).toLocaleString()}</p>
        </div>
      ))}

      <h3 style={{ marginTop: "20px" }}>Grand total: ₦{total().toLocaleString()}</h3>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
        <button className="btn btn-dark" onClick={() => loadOrderIntoCart(order.items)}>Reorder</button>
        <button className="btn btn-secondary" onClick={generatePdf}>Download BOQ</button>
        <button className="btn btn-secondary" onClick={sendWhatsApp}>Send to WhatsApp</button>
        <button className="btn btn-secondary" onClick={() => navigate("/orders")}>Back to history</button>
      </div>
    </div>
  );
}
