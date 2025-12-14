import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadProducts();
    }, 400); // debounce search

    return () => clearTimeout(delay);
  }, [search, category]);

  async function loadProducts() {
    try {
      setLoading(true);

      const params = {};
      if (search.trim() !== "") params.search = search.trim();
      if (category !== "All") params.category = category;

      const res = await axios.get(`${API}/products`, { params });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Shop Components</h2>

      <div style={filterBar}>
        <input
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All</option>
          <option value="Microcontrollers">Microcontrollers</option>
          <option value="Sensors">Sensors</option>
          <option value="ICs">ICs</option>
          <option value="Resistors">Resistors</option>
          <option value="Capacitors">Capacitors</option>
          <option value="Modules">Modules</option>
          <option value="Tools">Tools</option>
        </select>
      </div>

      {loading && <p>Searching components...</p>}

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

        {!loading && products.length === 0 && (
          <p>No components found.</p>
        )}
      </div>
    </div>
  );
}

const filterBar = {
  display: "flex",
  gap: "10px",
  margin: "20px 0",
};

const input = {
  padding: "10px",
  flex: 1,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "20px",
};

const card = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "6px",
};

const image = {
  width: "100%",
  height: "140px",
  objectFit: "contain",
};

const btn = {
  marginTop: "10px",
  width: "100%",
  padding: "8px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
};
