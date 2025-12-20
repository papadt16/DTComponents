import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";

const WHATSAPP_NUMBER = "2349038899075";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("dt_cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("dt_cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (productId) => {
    const updated = cart.map((item) =>
      item._id === productId ? { ...item, qty: item.qty + 1 } : item
    );
    updateCart(updated);
  };

  const loadOrderIntoCart = (items) => {
  updateCart(items); // overwrites current cart
};

  const decreaseQty = (productId) => {
    const item = cart.find((i) => i._id === productId);
    if (item.qty === 1) {
      if (window.confirm(`Remove ${item.title} from cart?`)) {
        const updated = cart.filter((i) => i._id !== productId);
        updateCart(updated);
      }
    } else {
      const updated = cart.map((i) =>
        i._id === productId ? { ...i, qty: i.qty - 1 } : i
      );
      updateCart(updated);
    }
  };

  const removeItem = (productId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      const updated = cart.filter((i) => i._id !== productId);
      updateCart(updated);
    }
  };

  const total = () => cart.reduce((s, p) => s + p.price * p.qty, 0);

const generatePdfAndSendWhatsApp = () => {
  const doc = new jsPDF();

  // === PDF generation code remains the same ===
  doc.setFontSize(16);
  doc.text("DTComponents", 105, 15, { align: "center" });
  doc.setFontSize(11);
  doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

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

  cart.forEach((item, index) => {
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
  doc.text(
    `Grand Total: ₦${total().toLocaleString()}`,
    195,
    y,
    { align: "right" }
  );

  const fileName = "DTComponents_BOQ.pdf";
  doc.save(fileName);

  // WhatsApp message
  let msg = "Hello DTComponents,%0A%0APlease find my BOQ attached.%0A%0AOrder Summary:%0A";
  cart.forEach((p) => {
    msg += `- ${p.qty} x ${p.title}%0A`;
  });
  msg += `%0AGrand Total: ₦${total().toLocaleString()}%0A%0AThank you.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

  // === NEW CODE: Save order to history and clear cart ===
  const orderHistory = JSON.parse(localStorage.getItem("dt_order_history") || "[]");
  const newOrder = {
    id: Date.now(), // unique order ID
    date: new Date().toLocaleString(),
    items: cart,
    total: total(),
  };
  localStorage.setItem("dt_order_history", JSON.stringify([newOrder, ...orderHistory]));

  // Clear cart
  updateCart([]);
};

  if (!cart.length) return <h2 style={{ padding: 30 }}>Your cart is empty</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Your Cart</h2>

      {cart.map((p) => (
        <div key={p._id} style={cartItem}>
          <img src={p.img} alt={p.title} style={img} />
          <div style={{ flex: 1 }}>
            <h4>{p.title}</h4>
            <p>₦{p.price}</p>
            <div style={qtyContainer}>
              <button onClick={() => decreaseQty(p._id)}>-</button>
              <span style={{ margin: "0 10px" }}>{p.qty}</span>
              <button onClick={() => increaseQty(p._id)}>+</button>
            </div>
          </div>
          <button onClick={() => removeItem(p._id)} style={removeBtn}>
            Remove
          </button>
        </div>
      ))}

      <h3>Total: ₦{total()}</h3>

     <button
      onClick={generatePdfAndSendWhatsApp}
      style={{
      padding: "12px 20px",
      background: "#16a34a",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontSize: 16,
      cursor: "pointer",
      }}
      >
     Generate BOQ PDF & Send to WhatsApp
    </button>
      
    {/* === ADD ORDER HISTORY BUTTON === */}
      <button
        style={{
          padding: "10px 18px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 20,
        }}
        onClick={() => navigate("/orders")} // navigate to order history page
      >
        View Order History
      </button>
    </div>
  );
}

/* ===== STYLES ===== */
const cartItem = {
  display: "flex",
  alignItems: "center",
  marginBottom: 20,
  padding: 10,
  background: "#f1f5f9",
  borderRadius: 8,
};

const img = {
  width: 80,
  height: 80,
  objectFit: "contain",
  marginRight: 15,
};

const qtyContainer = {
  display: "flex",
  alignItems: "center",
  marginTop: 8,
};

const removeBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
};
