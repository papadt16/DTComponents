import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

const WHATSAPP_NUMBER = "2349038899075";

export default function CartPage({ cart, updateCart }) {
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null); // { code, discountAmount }
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  const increaseQty = (productId) => {
    updateCart(cart.map((item) => (item._id === productId ? { ...item, qty: item.qty + 1 } : item)));
  };

  const decreaseQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    if (item.qty === 1) {
      if (window.confirm(`Remove ${item.title} from cart?`)) {
        updateCart(cart.filter((i) => i._id !== productId));
      }
    } else {
      updateCart(cart.map((i) => (i._id === productId ? { ...i, qty: i.qty - 1 } : i)));
    }
  };

  const removeItem = (productId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      updateCart(cart.filter((i) => i._id !== productId));
    }
  };

  const subtotal = () => cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const total = () => Math.max(0, subtotal() - (promo?.discountAmount || 0));

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setCheckingPromo(true);
    setPromoError("");
    try {
      const res = await axios.post(`${API}/promotions/validate`, {
        code: promoInput.trim(),
        cartTotal: subtotal(),
      });
      setPromo(res.data);
    } catch (err) {
      setPromo(null);
      setPromoError(err?.response?.data?.error || "Couldn't apply that code");
    } finally {
      setCheckingPromo(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  const checkout = async () => {
    setPlacing(true);
    try {
      // Persist the order server-side. Logged-in customers get it attached
      // to their account (visible in Order History on any device); guests
      // still get a working checkout, they just won't see it there later.
      // Note: promo usage counts only increment for this persisted path —
      // a guest applying a limited-use code won't decrement its remaining
      // uses server-side, only logged-in checkouts do.
      if (isLoggedIn()) {
        await axios.post(
          `${API}/orders`,
          { items: cart, discountCode: promo?.code },
          { headers: authHeaders() }
        );
      }
    } catch (err) {
      console.error("Order save failed, continuing with PDF/WhatsApp checkout:", err);
    }

    generatePdfAndSendWhatsApp();
    setPlacing(false);
  };

  const generatePdfAndSendWhatsApp = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("DTComponents", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableBody = cart.map((item, index) => [
      index + 1,
      item.title,
      item.qty,
      item.price.toLocaleString(),
      (item.qty * item.price).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["S/N", "Description", "Qty", "Unit (NGN)", "Amount (NGN)"]],
      body: tableBody,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [16, 56, 44], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 80 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Subtotal: NGN ${subtotal().toLocaleString()}`, 195, finalY, { align: "right" });

    if (promo) {
      finalY += 7;
      doc.text(`Discount (${promo.code}): -NGN ${promo.discountAmount.toLocaleString()}`, 195, finalY, { align: "right" });
    }

    finalY += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total: NGN ${total().toLocaleString()}`, 195, finalY, { align: "right" });
    doc.save("DTComponents_BOQ.pdf");

    let msg = "Hello DTComponents,%0A%0APlease find my BOQ.%0A%0AOrder Summary:%0A";
    cart.forEach((p) => {
      msg += `- ${p.qty} x ${p.title}%0A`;
    });
    if (promo) msg += `%0ADiscount (${promo.code}): -NGN ${promo.discountAmount.toLocaleString()}%0A`;
    msg += `%0AGrand Total: NGN ${total().toLocaleString()}%0A%0AThank you.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

    // Always keep a local copy too, so "View Order History" works
    // instantly even before the backend round-trip / for guests.
    const history = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
    history.unshift({
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart.map((i) => ({ ...i })),
      total: total(),
    });
    localStorage.setItem("dt_order_history", JSON.stringify(history));

    updateCart([]);
    removePromo();
  };

  if (!cart.length) {
    return (
      <div className="container section">
        <h2 className="section-title" style={{ marginBottom: "16px" }}>Your cart is empty</h2>
        <button className="btn btn-dark" onClick={() => navigate("/orders")}>
          View order history
        </button>
      </div>
    );
  }

  return (
    <div className="container section">
      <h2 className="section-title" style={{ marginBottom: "24px" }}>Your cart</h2>

      {cart.map((p) => (
        <div key={p._id} className="cart-item">
          <img src={p.img} alt={p.title} className="cart-item-img" loading="lazy" decoding="async" />
          <div style={{ flex: 1 }}>
            <div className="product-title" style={{ margin: 0 }}>{p.title}</div>
            <div className="product-price" style={{ margin: "4px 0" }}>₦{Number(p.price).toLocaleString()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => decreaseQty(p._id)}>−</button>
              <span>{p.qty}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => increaseQty(p._id)}>+</button>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => removeItem(p._id)}>Remove</button>
        </div>
      ))}

      <div className="promo-box">
        {promo ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              Code <strong>{promo.code}</strong> applied — −₦{promo.discountAmount.toLocaleString()}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={removePromo}>Remove</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              className="filter-search"
              style={{ maxWidth: "220px" }}
              placeholder="Promo code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPromo()}
            />
            <button className="btn btn-secondary" onClick={applyPromo} disabled={checkingPromo}>
              {checkingPromo ? "Checking…" : "Apply"}
            </button>
          </div>
        )}
        {promoError && <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "8px" }}>{promoError}</p>}
      </div>

      <div style={{ marginTop: "16px" }}>
        {promo && (
          <>
            <p style={{ margin: "2px 0" }}>Subtotal: ₦{subtotal().toLocaleString()}</p>
            <p style={{ margin: "2px 0", color: "var(--signal-dark)" }}>Discount: −₦{promo.discountAmount.toLocaleString()}</p>
          </>
        )}
        <h3 style={{ marginTop: "8px" }}>Total: ₦{total().toLocaleString()}</h3>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={checkout} disabled={placing}>
          {placing ? "Placing order…" : "Generate BOQ PDF & send to WhatsApp"}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/orders")}>
          View order history
        </button>
      </div>

      {!isLoggedIn() && (
        <p style={{ marginTop: "16px", fontSize: "14px" }}>
          <a href="/login" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>Sign in</a> to save this order to your account and view it from any device.
        </p>
      )}
    </div>
  );
}
