import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);

  async function loadProducts() {
    if (!search.trim()) {
      setProducts([]);
      return;
    }

    const res = await axios.get(`${API}/products`, {
      params: { search, category },
    });
    setProducts(res.data);
    setHasSearched(true);
  }

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  return (
    <div>
      {/* HERO SECTION */}
      <div style={hero}>
        <img
          src="https://rossum.ai/wp-content/uploads/2024/05/technology-2.jpg"
          alt="Electronics"
          style={heroImg}
        />
        <div style={heroOverlay}>
          <h1 style={heroTitle}>DTComponents</h1>
          <p style={heroText}>
            Find electronics components, modules & ICs instantly
          </p>

          <input
            placeholder="Search components, modules, ICs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={heroInput}
          />
        </div>
      </div>

      {/* FILTERS + PRODUCTS (ONLY AFTER SEARCH) */}
      {hasSearched && (
        <div style={{ padding: "30px" }}>
          <div style={filterBar}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All</option>
              <option>Microcontrollers</option>
              <option>Development Boards</option>
              <option>Sensors</option>
              <option>Modules</option>
              <option>Integrated Circuits (ICs)</option>
              <option>Power Components</option>
              <option>Prototyping</option>
              <option>Tools & Accessories</option>
            </select>
          </div>

          <div style={grid}>
            {products.map((p) => (
              <div key={p._id} style={card}>
                <img src={p.img} alt={p.title} style={image} />
                <h4>{p.title}</h4>
                <small>{p.sku}</small>
                <p>₦{p.price}</p>
                <button style={btn}>Add to Cart</button>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p style={{ marginTop: "20px", color: "#555" }}>
              No products found. Try another search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const hero = {
  position: "relative",
  height: "65vh",
  overflow: "hidden",
};

const heroImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "brightness(40%)",
};

const heroOverlay = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  textAlign: "center",
  padding: "20px",
};

const heroTitle = {
  fontSize: "42px",
  fontWeight: "bold",
};

const heroText = {
  marginTop: "10px",
  fontSize: "18px",
};

const heroInput = {
  marginTop: "25px",
  padding: "14px",
  width: "100%",
  maxWidth: "500px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "none",
};

const filterBar = {
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "20px",
};

const card = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "8px",
  background: "white",
};

const image = {
  width: "100%",
  height: "160px",
  objectFit: "contain",
};

const btn = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "4px",
};

