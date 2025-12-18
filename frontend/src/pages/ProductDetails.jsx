import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    axios.get(`${API}/products/${id}`).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("dt_cart")) || [];
    const existing = cart.find((i) => i._id === product._id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        img: product.img,
        qty,
      });
    }

    localStorage.setItem("dt_cart", JSON.stringify(cart));
    alert("Added to cart");
  }

  if (!product) return <p style={{ padding: 40 }}>Loading...</p>;

  const d = product.description || {};

  return (
    <div style={page}>
      {/* TOP SECTION */}
      <div style={container}>
        <img src={product.img} alt={product.title} style={image} />

        <div style={info}>
          <h2>{product.title}</h2>
          <p style={price}>₦{product.price}</p>

          <div style={qtyBox}>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          <button style={btn} onClick={addToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      {d && (
        <div style={descContainer}>
          {d.overview && (
            <Section title="Overview">
              <p>{d.overview}</p>
            </Section>
          )}

          {d.features?.length > 0 && (
            <Section title="Features">
              <ul>
                {d.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </Section>
          )}

          {d.applications?.length > 0 && (
            <Section title="Applications">
              <ul>
                {d.applications.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Section>
          )}

          {d.specifications && (
            <Section title="Specifications">
              <table style={specTable}>
                <tbody>
                  {Object.entries(d.specifications).map(([k, v]) => (
                    <tr key={k}>
                      <td style={specKey}>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== REUSABLE SECTION ===== */
function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

/* ===== STYLES ===== */

const page = { padding: "40px" };

const container = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};

const image = {
  width: "100%",
  maxHeight: "400px",
  objectFit: "contain",
};

const info = {
  display: "flex",
  flexDirection: "column",
};

const price = {
  fontSize: "22px",
  fontWeight: "bold",
  margin: "10px 0",
};

const qtyBox = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  margin: "20px 0",
};

const btn = {
  padding: "12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const descContainer = {
  marginTop: 50,
  lineHeight: 1.7,
  fontSize: 15,
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 600,
  borderBottom: "2px solid #e5e7eb",
  paddingBottom: 6,
};

const specTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const specKey = {
  fontWeight: 600,
  width: "40%",
  padding: "8px 6px",
  borderBottom: "1px solid #e5e7eb",
};
