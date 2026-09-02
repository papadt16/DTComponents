import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API from "./api.js";
import { authHeaders, isLoggedIn } from "./auth.js";

// Pulls the logged-in customer's saved contact/delivery details, so the
// generated BOQ can carry them without the person retyping anything.
// Returns null for guests or on any failure — callers just omit the
// contact block in that case rather than failing PDF generation.
export async function fetchCustomerContact() {
  if (!isLoggedIn()) return null;
  try {
    const res = await axios.get(`${API}/auth/me`, { headers: authHeaders() });
    const { name, email, phone, address, city, state } = res.data || {};
    return { name, email, phone, address, city, state };
  } catch {
    return null;
  }
}

// Builds the BOQ PDF. `discount` is optional: { code, amount }.
export function buildBoqPdf({ items, subtotal, discount, total, date, orderId, contact }) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("DTComponents", 105, 15, { align: "center" });
  doc.setFontSize(12);
  doc.text("Bill of Quantities (BOQ)", 105, 22, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 14, 30);
  if (orderId) doc.text(`Order #${String(orderId).slice(-6)}`, 14, 35);

  // Contact / delivery block — pulled from the customer's profile, since
  // discount and delivery pricing can change after this PDF is generated;
  // this is what lets DTComponents reach the buyer to finalize the order.
  let contactY = orderId ? 42 : 37;
  if (contact && (contact.name || contact.phone || contact.address)) {
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    if (contact.name) {
      doc.text(`Customer: ${contact.name}`, 14, contactY);
      contactY += 5;
    }
    if (contact.phone) {
      doc.text(`Phone: ${contact.phone}`, 14, contactY);
      contactY += 5;
    }
    const addressParts = [contact.address, contact.city, contact.state].filter(Boolean).join(", ");
    if (addressParts) {
      doc.text(`Delivery address: ${addressParts}`, 14, contactY);
      contactY += 5;
    }
    doc.setTextColor(0, 0, 0);
    contactY += 3;
  }

  const startY = Math.max(contactY, 40);

  const tableBody = items.map((item, index) => [
    index + 1,
    item.title,
    item.qty,
    Number(item.price).toLocaleString(),
    (item.qty * item.price).toLocaleString(),
  ]);

  autoTable(doc, {
    startY,
    head: [["S/N", "Description", "Qty", "Unit (NGN)", "Amount (NGN)"]],
    body: tableBody,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [11, 37, 68], textColor: 255 },
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
  doc.text(`Subtotal: NGN ${subtotal.toLocaleString()}`, 195, finalY, { align: "right" });

  if (discount && discount.amount > 0) {
    finalY += 7;
    doc.text(`Discount${discount.code ? ` (${discount.code})` : ""}: -NGN ${discount.amount.toLocaleString()}`, 195, finalY, { align: "right" });
  }

  finalY += 6;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Delivery fee, if applicable, is not included and will be confirmed separately.", 195, finalY, { align: "right" });
  doc.setTextColor(0, 0, 0);

  finalY += 9;
  doc.setFontSize(12);
  doc.text(`Grand Total: NGN ${total.toLocaleString()}`, 195, finalY, { align: "right" });

  return doc;
}

// Sends the BOQ PDF to WhatsApp. WhatsApp's click-to-chat link (wa.me)
// has no mechanism to attach a file — that's a WhatsApp platform
// restriction, not something that can be worked around client-side.
//
// So: on devices with the Web Share API (most mobile browsers), this
// hands the PDF straight to the OS share sheet with WhatsApp as one tap
// away — the file arrives pre-attached. Everywhere else (desktop), it
// downloads the PDF and opens WhatsApp with a text summary plus a
// reminder to attach the file that was just downloaded.
export async function sharePdfToWhatsApp({ doc, filename, message, whatsappNumber }) {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "DTComponents BOQ",
        text: message,
      });
      return { method: "share" };
    } catch {
      // User cancelled the share sheet, or it failed — fall through to
      // the download + wa.me fallback rather than leaving them stuck.
    }
  }

  doc.save(filename);
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message + "\n\n(PDF downloaded — please attach it to this chat.)")}`, "_blank");
  return { method: "fallback" };
}
