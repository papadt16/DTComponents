
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState("");

  async function loadProducts() {
    const res = await axios.get(`${API}/products`, {
      params: { search, category },
    });
    setProducts(res.data);
  }

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  // ✅ ADD TO CART
  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("dt_cart")) || [];

    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        img: product.img,
        qty: 1,
      });
    }

    localStorage.setItem("dt_cart", JSON.stringify(cart));
    showToast(`${product.title} added to cart`);
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div style={page}>
      <h2 style={title}>Electronic Components</h2>

      <div style={filterBar}>
        <input
          placeholder="Search components (ESP32, resistor, sensor...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={select}>
          <option>All</option>
          <option>Microcontrollers</option>
          <option>Sensors</option>
          <option>ICs</option>
          <option>Resistors</option>
          <option>Capacitors</option>
          <option>Modules</option>
          <option>Tools</option>
          <option>Displays</option>
          <option>Switches</option>
          <option>Transistors</option>
          <option>Diodes</option>
          <option>Connectors</option>
        </select>
      </div>

      <div style={grid}>
       {products.map((p) => (
           <div
           key={p._id}
           style={card}
           onClick={() => navigate(`/product/${p._id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <img
              src={p.img || "https://via.placeholder.com/200"}
              alt={p.title}
              style={image}
              onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
            />

            <h4 style={productTitle}>{p.title}</h4>
            <small style={sku}>{p.sku}</small>

            <p style={price}>₦{p.price}</p>

            <button
             style={btn}
             onClick={(e) => {
             e.stopPropagation();
             addToCart(p);
             }}
             >
             Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* TOAST */}
      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  padding: "30px",
  background: "#f8fafc",
  minHeight: "100vh",
};

const title = {
  marginBottom: "10px",
  fontSize: "26px",
};

const filterBar = {
  display: "flex",
  gap: "10px",
  margin: "20px 0",
};

const input = {
  padding: "12px",
  flex: 1,
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const select = {
  padding: "12px",
  borderRadius: "6px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "24px",
};

const card = {
  background: "white",
  borderRadius: "10px",
  padding: "16px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
};

const image = {
  width: "100%",
  height: "150px",
  objectFit: "contain",
  marginBottom: "10px",
};

const productTitle = {
  fontSize: "16px",
  margin: "6px 0",
};

const sku = {
  color: "#64748b",
  fontSize: "12px",
};

const price = {
  fontWeight: "bold",
  marginTop: "8px",
};

const btn = {
  marginTop: "12px",
  width: "100%",
  padding: "10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const toastStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  background: "#16a34a",
  color: "white",
  padding: "12px 18px",
  borderRadius: "6px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
}; "

