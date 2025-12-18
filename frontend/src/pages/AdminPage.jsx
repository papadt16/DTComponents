import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("dt_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    sku: "",
    category: "",
    price: "",
    description: "",
    img: "",
  });

  // ------------------------------
  // LOGIN
  // ------------------------------
  async function handleLogin() {
    try {
      const res = await axios.post(`${API}/admin/login`, login);
      localStorage.setItem("dt_token", res.data.token);
      setToken(res.data.token);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  }

  // ------------------------------
  // LOAD PRODUCTS
  // ------------------------------
  async function loadProducts() {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }

  // ------------------------------
  // SAVE NEW PRODUCT
  // ------------------------------
  async function saveProduct() {
    const res = await axios.post(`${API}/products`, newProduct, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Product added!");
    setNewProduct({
      title: "",
      sku: "",
      category: "",
      price: "",
      description: "",
      img: "",
    });
    loadProducts();
  }

  // ------------------------------
  // UPDATE EXISTING PRODUCT
  // ------------------------------
  async function updateProduct(index, field, value) {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);

    await axios.put(
      `${API}/products/${updatedProducts[index]._id}`,
      { [field]: value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // ------------------------------
  // DELETE PRODUCT
  // ------------------------------
  async function deleteProduct(index) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const updatedProducts = [...products];
    const id = updatedProducts[index]._id;

    await axios.delete(`${API}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  }

  // ------------------------------
  // LOGIN SCREEN
  // ------------------------------
  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input
          placeholder="Username"
          onChange={(e) => setLogin({ ...login, username: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setLogin({ ...login, password: e.target.value })}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  // ------------------------------
  // MAIN ADMIN PANEL
  // ------------------------------
  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Panel</h2>

      {/* === NEW PRODUCT === */}
      <div style={{ marginBottom: 30 }}>
        <h3>Add New Product</h3>
        <input
          placeholder="Title"
          value={newProduct.title}
          onChange={(e) =>
            setNewProduct({ ...newProduct, title: e.target.value })
          }
        />
        <input
          placeholder="SKU"
          value={newProduct.sku}
          onChange={(e) =>
            setNewProduct({ ...newProduct, sku: e.target.value })
          }
        />
        <input
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        />
        <input
          placeholder="Price"
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />
        <textarea
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <input
          placeholder="Image URL"
          value={newProduct.img}
          onChange={(e) =>
            setNewProduct({ ...newProduct, img: e.target.value })
          }
        />
        {newProduct.img && (
          <img src={newProduct.img} alt="" style={{ width: 120 }} />
        )}
        <button onClick={saveProduct}>Save Product</button>
      </div>

      <hr />

      {/* === PRODUCT LIST === */}
      <h3>All Products</h3>
      <table
        border={1}
        cellPadding={8}
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#0ea5e9", color: "white" }}>
            <th>#</th>
            <th>Image</th>
            <th>Title</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p._id}>
              <td>{index + 1}</td>
              <td>
                <input
                  placeholder="Image URL"
                  value={p.img}
                  onChange={(e) =>
                    updateProduct(index, "img", e.target.value)
                  }
                  style={{ width: "100px" }}
                />
              </td>
              <td>
                <input
                  value={p.title}
                  onChange={(e) =>
                    updateProduct(index, "title", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  value={p.sku}
                  onChange={(e) => updateProduct(index, "sku", e.target.value)}
                />
              </td>
              <td>
                <input
                  value={p.category}
                  onChange={(e) =>
                    updateProduct(index, "category", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={p.price}
                  onChange={(e) =>
                    updateProduct(index, "price", Number(e.target.value))
                  }
                />
              </td>
              <td>
                <textarea
                  value={p.description}
                  onChange={(e) =>
                    updateProduct(index, "description", e.target.value)
                  }
                />
              </td>
              <td>
                <button onClick={() => deleteProduct(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* === BULK IMPORT CSV === */}
      <h3>Bulk Import (CSV)</h3>
      <p>CSV columns: title,sku,category,price,description,img</p>
      <input
        type="file"
        onChange={async (e) => {
          const form = new FormData();
          form.append("file", e.target.files[0]);
          await axios.post(`${API}/products/import`, form, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Import complete");
          loadProducts();
        }}
      />
    </div>
  );
}
