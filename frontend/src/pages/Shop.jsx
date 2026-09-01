import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";
import { authHeaders, isLoggedIn } from "../utils/auth.js";

const CATEGORIES = [
  "All",
  "Microcontrollers",
  "Sensors",
  "ICs",
  "Resistors",
  "Capacitors",
  "Modules",
  "Tools",
  "Displays",
  "Switches",
  "Transistors",
  "Diodes",
  "Connectors",
];

function stockInfo(stock) {
  if (stock === undefined || stock === null) return null; // older records without stock tracked yet
  if (stock <= 0) return { label: "Out of stock", cls: "out" };
  if (stock <= 5) return { label: `Only ${stock} left`, cls: "low" };
  return { label: "In stock", cls: "in" };
}

export default function Shop({ cart, updateCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [toast, setToast] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products`, { params: { search, category } });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function loadWishlist() {
    if (!isLoggedIn()) return;
    try {
      const res = await axios.get(`${API}/wishlist`, { headers: authHeaders() });
      setWishlistIds(new Set(res.data.map((p) => p._id)));
    } catch {
      // not fatal — hearts just show unfilled
    }
  }

  useEffect(() => {
    // Debounced: typing "resistor" previously fired 8 separate requests
    // (one per keystroke). This waits for a pause before hitting the API.
    const timeout = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  useEffect(() => {
    loadWishlist();
  }, []);

  function addToCart(product) {
    const existing = cart.find((item) => item._id === product._id);
    let updatedCart;

    if (existing) {
      updatedCart = cart.map((item) =>
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      updatedCart = [...cart, { _id: product._id, title: product.title, price: product.price, img: product.img, qty: 1 }];
    }

    updateCart(updatedCart);
    showToast(`${product.title} added to cart`);
  }

  async function toggleWishlist(e, productId) {
    e.stopPropagation();
    if (!isLoggedIn()) {
      navigate("/login?redirect=/shop");
      return;
    }
    const res = await axios.post(`${API}/wishlist/${productId}`, {}, { headers: authHeaders() });
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (res.data.added) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h2 className="section-title">Electronic components</h2>
          <p className="section-sub">{loading ? "Loading…" : `${products.length} component${products.length === 1 ? "" : "s"}`}</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="filter-search"
          placeholder="Search components (ESP32, resistor, sensor...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pill-row" style={{ marginBottom: "24px" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p style={{ padding: "40px 0" }}>
          No components match that search yet. Try a different term, or{" "}
          <a href="https://wa.me/2349038899075" target="_blank" rel="noreferrer" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>
            ask us on WhatsApp
          </a>.
        </p>
      )}

      <div className="product-grid">
        {products.map((p) => {
          const stock = stockInfo(p.stock);
          const outOfStock = stock?.cls === "out";
          const saved = wishlistIds.has(p._id);

          return (
            <div key={p._id} className="product-card" onClick={() => navigate(`/product/${p._id}`)}>
              <div className="product-card-img-wrap" style={{ position: "relative" }}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={p.img || "https://via.placeholder.com/200"}
                  alt={p.title}
                  className="product-card-img"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                />
                <button
                  className="wishlist-toggle"
                  aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                  onClick={(e) => toggleWishlist(e, p._id)}
                >
                  {saved ? "♥" : "♡"}
                </button>
              </div>

              {p.sku && <div className="product-sku">{p.sku}</div>}
              <div className="product-title">{p.title}</div>
              <div className="product-price">₦{Number(p.price).toLocaleString()}</div>
              {stock && <div className={`product-stock ${stock.cls}`}>{stock.label}</div>}

              <button
                className="btn btn-dark btn-sm btn-block"
                disabled={outOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(p);
                }}
              >
                {outOfStock ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          );
        })}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
