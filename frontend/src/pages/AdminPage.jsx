import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

const emptyDesc = {
  overview: "",
  features: [""],
  applications: [""],
  specifications: {},
};

function normalizeDescription(desc) {
  if (!desc || typeof desc === "string") {
    return { ...emptyDesc, overview: desc || "" };
  }
  return {
    overview: desc.overview || "",
    features: desc.features?.length ? desc.features : [""],
    applications: desc.applications?.length ? desc.applications : [""],
    specifications: desc.specifications || {},
  };
}

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
    description: emptyDesc,
  });

  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  // ---------------- LOGIN ----------------
  async function handleLogin() {
    const res = await axios.post(`${API}/admin/login`, login);
    localStorage.setItem("dt_token", res.data.token);
    setToken(res.data.token);
  }

  // ---------------- LOAD PRODUCTS ----------------
  async function loadProducts() {
    const res = await axios.get(`${API}/products`);
    const normalized = res.data.map((p) => ({
      ...p,
      description: normalizeDescription(p.description),
    }));
    setProducts(normalized);
  }

  // ---------------- ADD PRODUCT ----------------
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
      description: emptyDesc,
    });
    loadProducts();
  }

  // ---------------- UPDATE PRODUCT ----------------
  async function updateProduct(id, updatedData) {
    await axios.put(`${API}/products/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ---------------- DELETE PRODUCT ----------------
  async function deleteProduct(id) {
    if (!confirm("Delete product?")) return;

    await axios.delete(`${API}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  }

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

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Panel</h2>

      {/* ADD PRODUCT */}
      <h3>Add Product</h3>
      <input placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
      <input placeholder="SKU" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
      <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
      <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
      <input placeholder="Image URL" value={newProduct.img} onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })} />

      <textarea
        placeholder="Overview"
        value={newProduct.description.overview}
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            description: { ...newProduct.description, overview: e.target.value },
          })
        }
      />

      <button onClick={saveProduct}>Save Product</button>

      <hr />

      {/* EXISTING PRODUCTS */}
      <h3>Existing Products</h3>

      {products.map((p, i) => (
        <div key={p._id} style={{ border: "1px solid #ccc", padding: 20, marginBottom: 20 }}>
          <input value={p.title} onChange={(e) => {
            const copy = [...products];
            copy[i].title = e.target.value;
            setProducts(copy);
          }} />

          <input value={p.sku} onChange={(e) => {
            const copy = [...products];
            copy[i].sku = e.target.value;
            setProducts(copy);
          }} />

          <input value={p.category} onChange={(e) => {
            const copy = [...products];
            copy[i].category = e.target.value;
            setProducts(copy);
          }} />

          <input type="number" value={p.price} onChange={(e) => {
            const copy = [...products];
            copy[i].price = Number(e.target.value);
            setProducts(copy);
          }} />

          <textarea
            value={p.description.overview}
            onChange={(e) => {
              const copy = [...products];
              copy[i].description.overview = e.target.value;
              setProducts(copy);
            }}
          />

          <button onClick={() => updateProduct(p._id, p)}>Save Changes</button>
          <button onClick={() => deleteProduct(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
