import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

export default function WishlistPage({ cart, updateCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login?redirect=/wishlist");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/wishlist`, { headers: authHeaders() });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function remove(productId) {
    await axios.post(`${API}/wishlist/${productId}`, {}, { headers: authHeaders() });
    setItems((prev) => prev.filter((p) => p._id !== productId));
  }

  function addToCart(product) {
    const existing = cart.find((item) => item._id === product._id);
    const updated = existing
      ? cart.map((item) => (item._id === product._id ? { ...item, qty: item.qty + 1 } : item))
      : [...cart, { _id: product._id, title: product.title, price: product.price, img: product.img, qty: 1 }];
    updateCart(updated);
  }

  if (loading) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h2 className="section-title">Your wishlist</h2>
          <p className="section-sub">{items.length} saved component{items.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p>
          Nothing saved yet. Tap the heart on any component to save it here.
        </p>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <div key={p._id} className="product-card">
              <div className="product-card-img-wrap" onClick={() => navigate(`/product/${p._id}`)}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={p.img || "https://via.placeholder.com/200"}
                  alt={p.title}
                  className="product-card-img"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                />
              </div>
              {p.sku && <div className="product-sku">{p.sku}</div>}
              <div className="product-title">{p.title}</div>
              <div className="product-price">₦{Number(p.price).toLocaleString()}</div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-dark btn-sm" style={{ flex: 1 }} onClick={() => addToCart(p)}>
                  Add to cart
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => remove(p._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
