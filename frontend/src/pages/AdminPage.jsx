import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

const emptyDescription = {
  overview: "",
  features: [],
  applications: [],
  specifications: {},
};

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("dt_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    sku: "",
    category: "",
    price: "",
    img: "",
    description: emptyDescription,
  });

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  async function loadProducts() {
    const res = await axios.get(`${API}/products`);
    const normalized = res.data.map((p) => ({
      ...p,
      description:
        typeof p.description === "string"
          ? { ...emptyDescription, overview: p.description }
          : p.description || emptyDescription,
    }));
    setProducts(normalized);
  }

  /* ================= LOGIN ================= */
  async function handleLogin() {
    const res = await axios.post(`${API}/admin/login`, login);
    localStorage.setItem("dt_token", res.data.token);
    setToken(res.data.token);
  }

  /* ================= SAVE NEW PRODUCT ================= */
  async function saveProduct() {
    await axios.post(`${API}/products`, newProduct, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Product added");
    setNewProduct({
      title: "",
      sku: "",
      category: "",
      price: "",
      img: "",
      description: emptyDescription,
    });
    loadProducts();
  }

  /* ================= UPDATE PRODUCT ================= */
  async function updateProduct(index) {
    const p = products[index];
    await axios.put(`${API}/products/${p._id}`, p, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Product updated");
  }

  /* ================= DELETE ================= */
  async function deleteProduct(index) {
    if (!confirm("Delete this product?")) return;
    const id = products[index]._id;
    await axios.delete(`${API}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  }

  /* ================= LOGIN SCREEN ================= */
  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input placeholder="Username" onChange={(e) => setLogin({ ...login, username: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setLogin({ ...login, password: e.target.value })} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Panel</h2>

      {/* ===== ADD PRODUCT ===== */}
      <h3>Add New Product</h3>
      <input placeholder="Title" onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
      <input placeholder="SKU" onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
      <input placeholder="Category" onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
      <input type="number" placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
      <input placeholder="Image URL" onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })} />

      <textarea
        placeholder="Overview"
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            description: { ...newProduct.description, overview: e.target.value },
          })
        }
      />

      <button onClick={saveProduct}>Save Product</button>

      <hr />

      {/* ===== EXISTING PRODUCTS ===== */}
      <h3>Existing Products</h3>

      {products.map((p, i) => (
        <div key={p._id} style={card}>
          <input value={p.title} onChange={(e) => edit(i, "title", e.target.value)} />
          <input value={p.price} type="number" onChange={(e) => edit(i, "price", Number(e.target.value))} />
          <input value={p.img} onChange={(e) => edit(i, "img", e.target.value)} />

          <textarea
            value={p.description.overview}
            onChange={(e) => editDesc(i, "overview", e.target.value)}
            placeholder="Overview"
          />

          <textarea
            value={p.description.features.join("\n")}
            onChange={(e) => editDesc(i, "features", e.target.value.split("\n"))}
            placeholder="Features (one per line)"
          />

          <textarea
            value={p.description.applications.join("\n")}
            onChange={(e) => editDesc(i, "applications", e.target.value.split("\n"))}
            placeholder="Applications (one per line)"
          />

          <button onClick={() => updateProduct(i)}>Save</button>
          <button onClick={() => deleteProduct(i)} style={{ background: "red", color: "white" }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );

  /* ===== HELPERS ===== */
  function edit(index, field, value) {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  }

  function editDesc(index, field, value) {
    const updated = [...products];
    updated[index].description[field] = value;
    setProducts(updated);
  }
}

/* ===== STYLES ===== */
const card = {
  border: "1px solid #ddd",
  padding: 15,
  marginBottom: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
