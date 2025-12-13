import { useState } from "react";
import jsPDF from "jspdf";

const WHATSAPP_NUMBER = "2349038899075";

export default function CartPage() {
  const [cart] = useState(
    JSON.parse(localStorage.getItem("dt_cart") || "[]")
  );

  function total() {
    return cart.reduce((s, p) => s + p.price * p.qty, 0);
  }

  function generatePDF() {
    const doc = new jsPDF();
    doc.text("DTComponents Order Receipt", 10, 10);

    let y = 20;
    cart.forEach((p) => {
      doc.text(`${p.qty} x ${p.title} - ₦${p.qty * p.price}`, 10, y);
      y += 10;
    });

    doc.text(`Total: ₦${total()}`, 10, y + 10);
    doc.save("DTComponents_Order.pdf");
  }

  function sendWhatsApp() {
    let msg = "DTComponents Order%0A";
    cart.forEach((p) => {
      msg += `${p.qty} x ${p.title} = ₦${p.qty * p.price}%0A`;
    });
    msg += `Total: ₦${total()}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`);
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Your Cart</h2>

      {cart.map((p) => (
        <div key={p.id}>
          {p.qty} x {p.title} — ₦{p.price}
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
