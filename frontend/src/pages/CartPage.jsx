import { useState, useEffect } from "react";
import jsPDF from "jspdf";

const WHATSAPP_NUMBER = "2349038899075";

export default function CartPage() {
  const [cart, setCart] = useState([]);

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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("DTComponents Order Receipt", 10, 10);

    let y = 20;
    cart.forEach((p) => {
      doc.text(`${p.qty} x ${p.title} - ₦${p.qty * p.price}`, 10, y);
      y += 10;
    });

    doc.text(`Total: ₦${total()}`, 10, y + 10);
    doc.save("DTComponents_Order.pdf");
  };

  const sendWhatsApp = () => {
    let msg = "DTComponents Order%0A";
    cart.forEach((p) => {
      msg += `${p.qty} x ${p.title} = ₦${p.qty * p.price}%0A`;
    });
    msg += `Total: ₦${total()}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
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

      <button onClick={generatePDF}>Generate PDF</button>
      <button onClick={sendWhatsApp} style={{ marginLeft: "10px" }}>
        Send to WhatsApp
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
