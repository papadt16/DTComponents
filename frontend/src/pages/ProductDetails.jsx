import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

function stockInfo(stock) {
  if (stock === undefined || stock === null) return null;
  if (stock <= 0) return { label: "Out of stock", cls: "out" };
  if (stock <= 5) return { label: `Only ${stock} left in stock`, cls: "low" };
  return { label: "In stock", cls: "in" };
}

export default function ProductDetails({ cart = [], updateCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    axios.get(`${API}/products/${id}`).then((res) => setProduct(res.data));
    if (isLoggedIn()) {
      axios.get(`${API}/wishlist`, { headers: authHeaders() }).then((res) => {
        setSaved(res.data.some((p) => p._id === id));
      });
    }
  }, [id]);

  function addToCart() {
    const existing = cart.find((i) => i._id === product._id);
    const updated = existing
      ? cart.map((i) => (i._id === product._id ? { ...i, qty: i.qty + qty } : i))
      : [...cart, { _id: product._id, title: product.title, price: product.price, img: product.img, qty }];

    updateCart(updated);
    showToast("Added to cart");
  }

  async function toggleWishlist() {
    if (!isLoggedIn()) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    const res = await axios.post(`${API}/wishlist/${id}`, {}, { headers: authHeaders() });
    setSaved(res.data.added);
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  if (!product) return <p className="container section">Loading…</p>;

  const d =
    typeof product.description === "string"
      ? { overview: product.description }
      : product.description || {};

  const stock = stockInfo(product.stock);
  const outOfStock = stock?.cls === "out";

  return (
    <div className="container section">
      <div className="product-detail-grid">
        <div className="product-card-img-wrap" style={{ height: "360px" }}>
          <img src={product.img} alt={product.title} className="product-card-img" style={{ maxHeight: "320px" }} />
        </div>

        <div>
          {product.sku && <div className="product-sku">{product.sku}</div>}
          <h2 style={{ margin: "6px 0 10px" }}>{product.title}</h2>
          <p className="product-price" style={{ fontSize: "28px", marginBottom: "6px" }}>
            ₦{Number(product.price).toLocaleString()}
          </p>
          {stock && <div className={`product-stock ${stock.cls}`} style={{ marginBottom: "16px" }}>{stock.label}</div>}

          <div style={qtyBox}>
            <button className="btn btn-secondary btn-sm" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setQty(qty + 1)}>+</button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-dark" style={{ flex: 1 }} onClick={addToCart} disabled={outOfStock}>
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
            <button className="btn btn-secondary" onClick={toggleWishlist}>
              {saved ? "♥ Saved" : "♡ Save"}
            </button>
          </div>
        </div>
      </div>

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

        {d.specifications && Object.keys(d.specifications).length > 0 && (
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

const qtyBox = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  margin: "16px 0 20px",
};

const descContainer = {
  marginTop: 50,
  lineHeight: 1.7,
  fontSize: 15,
  maxWidth: "70ch",
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 600,
  borderBottom: "2px solid var(--border)",
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
  borderBottom: "1px solid var(--border)",
};
