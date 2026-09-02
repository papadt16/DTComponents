import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";
import { buildBoqPdf, sharePdfToWhatsApp, fetchCustomerContact } from "../utils/boq.js";

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
  const [sending, setSending] = useState(false);

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
          subtotal: res.data.subtotal,
          discountCode: res.data.discountCode,
          discountAmount: res.data.discountAmount,
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

  const subtotal = () => order.subtotal ?? order.items.reduce((s, p) => s + p.price * p.qty, 0);
  const total = () => order.total ?? subtotal();

  const generatePdf = async () => {
    const contact = await fetchCustomerContact();
    const doc = buildBoqPdf({
      items: order.items,
      subtotal: subtotal(),
      discount: order.discountAmount > 0 ? { code: order.discountCode, amount: order.discountAmount } : null,
      total: total(),
      date: order.date,
      orderId: order.id,
      contact,
    });
    doc.save(`Order_${order.id}_BOQ.pdf`);
  };

  const sendWhatsApp = async () => {
    setSending(true);
    try {
      const contact = await fetchCustomerContact();
      const doc = buildBoqPdf({
        items: order.items,
        subtotal: subtotal(),
        discount: order.discountAmount > 0 ? { code: order.discountCode, amount: order.discountAmount } : null,
        total: total(),
        date: order.date,
        orderId: order.id,
        contact,
      });

      let msg = `Hello DTComponents,\n\nPlease find my BOQ attached (Order #${String(order.id).slice(-6)}).\n\nOrder Summary:\n`;
      order.items.forEach((p) => {
        msg += `- ${p.qty} x ${p.title}\n`;
      });
      if (order.discountAmount > 0) msg += `\nDiscount${order.discountCode ? ` (${order.discountCode})` : ""}: -₦${order.discountAmount.toLocaleString()}\n`;
      msg += `\nGrand Total: ₦${total().toLocaleString()}\n\nThank you.`;

      await sharePdfToWhatsApp({ doc, filename: `Order_${order.id}_BOQ.pdf`, message: msg, whatsappNumber: WHATSAPP_NUMBER });
    } finally {
      setSending(false);
    }
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

      <div style={{ marginTop: "20px" }}>
        {order.discountAmount > 0 && (
          <>
            <p style={{ margin: "2px 0" }}>Subtotal: ₦{subtotal().toLocaleString()}</p>
            <p style={{ margin: "2px 0", color: "var(--signal-dark)" }}>
              Discount{order.discountCode ? ` (${order.discountCode})` : ""}: −₦{order.discountAmount.toLocaleString()}
            </p>
          </>
        )}
        <h3 style={{ marginTop: "8px" }}>Grand total: ₦{total().toLocaleString()}</h3>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
        <button className="btn btn-dark" onClick={() => loadOrderIntoCart(order.items)}>Reorder</button>
        <button className="btn btn-secondary" onClick={generatePdf}>Download BOQ</button>
        <button className="btn btn-secondary" onClick={sendWhatsApp} disabled={sending}>
          {sending ? "Preparing…" : "Send to WhatsApp"}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/orders")}>Back to history</button>
      </div>
    </div>
  );
}
