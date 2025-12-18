import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("dt_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [products, setProducts] = useState([]);

  const emptyDescription = {
    overview: "",
    features: [""],
    applications: [""],
    specifications: {},
  };

  const [newProduct, setNewProduct] = useState({
    title: "",
    sku: "",
    category: "",
    price: "",
    img: "",
    description: emptyDescription,
  });

  useEffect(() => {
    if (token) loadProducts();
  }, [token]);

  // ---------------- LOGIN ----------------
  async function handleLogin() {
    try {
      const res = await axios.post(`${API}/admin/login`, login);
      localStorage.setItem("dt_token", res.data.token);
      setToken(res.data.token);
    } catch {
      alert("Login failed");
    }
  }

  // ---------------- LOAD PRODUCTS ----------------
  async function loadProducts() {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
  }

  // ---------------- SAVE PRODUCT ----------------
  async function saveProduct() {
    await axios.post(`${API}/products`, newProduct, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Product added!");
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

  // ---------------- DELETE ----------------
  async function deleteProduct(index) {
    if (!confirm("Delete this product?")) return;
    const id = products[index]._id;

    await axios.delete(`${API}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    loadProducts();
  }

  // ---------------- LOGIN SCREEN ----------------
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

  // ---------------- ADMIN PANEL ----------------
  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Panel</h2>

      {/* ADD PRODUCT */}
      <h3>Add New Product</h3>

      <input placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
      <input placeholder="SKU" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
      <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
      <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
      <input placeholder="Image URL" value={newProduct.img} onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })} />

      {/* DESCRIPTION STRUCTURE */}
      <h4>Overview</h4>
      <textarea
        value={newProduct.description.overview}
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            description: { ...newProduct.description, overview: e.target.value },
          })
        }
      />

      <h4>Features</h4>
      {newProduct.description.features.map((f, i) => (
        <input
          key={i}
          value={f}
          placeholder="Feature"
          onChange={(e) => {
            const features = [...newProduct.description.features];
            features[i] = e.target.value;
            setNewProduct({ ...newProduct, description: { ...newProduct.description, features } });
          }}
        />
      ))}
      <button onClick={() => setNewProduct({
        ...newProduct,
        description: { ...newProduct.description, features: [...newProduct.description.features, ""] },
      })}>
        + Add Feature
      </button>

      <h4>Applications</h4>
      {newProduct.description.applications.map((a, i) => (
        <input
          key={i}
          value={a}
          placeholder="Application"
          onChange={(e) => {
            const applications = [...newProduct.description.applications];
            applications[i] = e.target.value;
            setNewProduct({ ...newProduct, description: { ...newProduct.description, applications } });
          }}
        />
      ))}
      <button onClick={() => setNewProduct({
        ...newProduct,
        description: { ...newProduct.description, applications: [...newProduct.description.applications, ""] },
      })}>
        + Add Application
      </button>

      <h4>Specifications</h4>
      <input id="specKey" placeholder="Spec Name" />
      <input id="specValue" placeholder="Spec Value" />
      <button
        onClick={() => {
          const k = document.getElementById("specKey").value;
          const v = document.getElementById("specValue").value;
          if (!k || !v) return;

          setNewProduct({
            ...newProduct,
            description: {
              ...newProduct.description,
              specifications: {
                ...newProduct.description.specifications,
                [k]: v,
              },
            },
          });

          document.getElementById("specKey").value = "";
          document.getElementById("specValue").value = "";
        }}
      >
        Add Spec
      </button>

      <button onClick={saveProduct} style={{ marginTop: 20 }}>
        Save Product
      </button>

      <hr />

      {/* PRODUCT LIST */}
      <h3>All Products ({products.length})</h3>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr style={{ background: "#0ea5e9", color: "#fff" }}>
            <th>#</th>
            <th>Title</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.title}</td>
              <td>{p.sku}</td>
              <td>₦{p.price}</td>
              <td>
                <button onClick={() => deleteProduct(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
