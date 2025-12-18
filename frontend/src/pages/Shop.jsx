import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("All");

  async function loadProducts() {
    const res = await axios.get(`${API}/products`, {
      params: { search, category },
    });
    setProducts(res.data);
  }

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  // ✅ ADD TO CART LOGIC
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
    alert(`${product.title} added to cart`);
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
          <div key={p._id} style={card}>
            <img src={p.img} alt={p.title} style={image} />
            <h4>{p.title}</h4>
            <small>{p.sku}</small>
            <p><b>₦{p.price}</b></p>

            <button style={btn} onClick={() => addToCart(p)}>
              Add to Cart
            </button>
          </div>
        ))}
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
  cursor: "pointer",
};
