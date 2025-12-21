import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const WHATSAPP_NUMBER = "2349038899075";

export default function CartPage({ cart, updateCart }) {
  const navigate = useNavigate();

  const increaseQty = (productId) => {
    const updated = cart.map((item) =>
      item._id === productId
        ? { ...item, qty: item.qty + 1 }
        : item
    );
    updateCart(updated);
  };

  const decreaseQty = (productId) => {
    const item = cart.find((i) => i._id === productId);

    if (item.qty === 1) {
      if (window.confirm(`Remove ${item.title} from cart?`)) {
        updateCart(cart.filter((i) => i._id !== productId));
      }
    } else {
      updateCart(
        cart.map((i) =>
          i._id === productId
            ? { ...i, qty: i.qty - 1 }
            : i
        )
      );
    }
  };

  const removeItem = (productId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      updateCart(cart.filter((i) => i._id !== productId));
    }
  };

  const total = () =>
    cart.reduce((sum, p) => sum + p.price * p.qty, 0);


const generatePdfAndSendWhatsApp = () => {
  const doc = new jsPDF();

  // HEADER
  doc.setFontSize(16);
  doc.text("DTComponents", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  // TABLE DATA
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
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // dark blue
      textColor: 255,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 80 },
      2: { cellWidth: 15 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  // TOTAL
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(
    `Grand Total: NGN ${total().toLocaleString()}`,
    195,
    finalY,
    { align: "right" }
  );

  // SAVE
  doc.save("DTComponents_BOQ.pdf");

  // WHATSAPP MESSAGE
  let msg =
    "Hello DTComponents,%0A%0APlease find my BOQ.%0A%0AOrder Summary:%0A";

  cart.forEach((p) => {
    msg += `- ${p.qty} x ${p.title}%0A`;
  });

  msg += `%0AGrand Total: NGN ${total().toLocaleString()}%0A%0AThank you.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,
    "_blank"
  );

  // SAVE ORDER HISTORY
  const history = JSON.parse(
    localStorage.getItem("dt_order_history") || "[]"
  );

  history.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    items: cart.map(i => ({ ...i })),
    total: total(),
  });

  localStorage.setItem(
    "dt_order_history",
    JSON.stringify(history)
  );

  // CLEAR CART
  updateCart([]);
};

 if (!cart.length) {
  return (
    <div style={{ padding: 30 }}>
      <h2>Your cart is empty</h2>

      <button
        onClick={() => navigate("/orders")}
        style={{
          padding: "10px 18px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        View Order History
      </button>
    </div>
  );
}

  return (
    <div style={{ padding: 30 }}>
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

          <button
            onClick={() => removeItem(p._id)}
            style={removeBtn}
          >
            Remove
          </button>
        </div>
      ))}

      <h3>Total: ₦{total().toLocaleString()}</h3>

      <button
        onClick={generatePdfAndSendWhatsApp}
        style={checkoutBtn}
      >
        Generate BOQ PDF & Send to WhatsApp
      </button>

      <br /><br />

      <button
        onClick={() => navigate("/orders")}
        style={historyBtn}
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

const checkoutBtn = {
  padding: "12px 20px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};

const historyBtn = {
  padding: "10px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
