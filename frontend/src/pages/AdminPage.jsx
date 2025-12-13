import { useState } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("dt_token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [product, setProduct] = useState({
    title: "",
    sku: "",
    category: "",
    price: "",
    description: "",
    img: "",
  });

  async function handleLogin() {
    const res = await axios.post(`${API}/admin/login`, login);
    localStorage.setItem("dt_token", res.data.token);
    setToken(res.data.token);
  }

  async function uploadImage(file) {
    const form = new FormData();
    form.append("image", file);

    const res = await axios.post(`${API}/upload`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setProduct({ ...product, img: res.data.url });
  }

  async function saveProduct() {
    await axios.post(`${API}/products`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert("Product added");
  }

  if (!token) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input
          placeholder="Username"
          onChange={(e) =>
            setLogin({ ...login, username: e.target.value })
          }
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) =>
            setLogin({ ...login, password: e.target.value })
          }
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Panel</h2>

      <input
        placeholder="Title"
        onChange={(e) => setProduct({ ...product, title: e.target.value })}
      />
      <input
        placeholder="SKU"
        onChange={(e) => setProduct({ ...product, sku: e.target.value })}
      />
      <input
        placeholder="Category"
        onChange={(e) =>
          setProduct({ ...product, category: e.target.value })
        }
      />
      <input
        placeholder="Price"
        type="number"
        onChange={(e) =>
          setProduct({ ...product, price: Number(e.target.value) })
        }
      />
      <textarea
        placeholder="Description"
        onChange={(e) =>
          setProduct({ ...product, description: e.target.value })
        }
      />

      <input type="file" onChange={(e) => uploadImage(e.target.files[0])} />

      {product.img && (
        <img src={product.img} alt="" style={{ width: 120 }} />
      )}

      <button onClick={saveProduct}>Save Product</button>

      <hr />

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
        }}
      />
    </div>
  );
}

