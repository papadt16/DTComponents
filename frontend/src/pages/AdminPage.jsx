import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import API from "../utils/api.js";
import AdminGate from "../components/AdminGate.jsx";
import AdminShell from "../components/AdminShell.jsx";

const emptyDescription = {
  overview: "",
  features: [],
  applications: [],
  specifications: {},
};

const emptyNewProduct = {
  title: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  img: "",
  description: emptyDescription,
};

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminShell title="Products">
        <ProductsPanel />
      </AdminShell>
    </AdminGate>
  );
}

function ProductsPanel() {
  const token = localStorage.getItem("dt_token");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [newProduct, setNewProduct] = useState(emptyNewProduct);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const res = await axios.get(`${API}/products`);
    const normalized = res.data.map((p) => ({
      ...p,
      description:
        typeof p.description === "string"
          ? { ...emptyDescription, overview: p.description }
          : p.description || emptyDescription,
    }));
    setProducts(normalized);
    setLoading(false);
  }

  async function saveNewProduct() {
    if (!newProduct.title || !newProduct.price) {
      alert("Title and price are required.");
      return;
    }
    await axios.post(`${API}/products`, newProduct, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewProduct(emptyNewProduct);
    setShowAddForm(false);
    loadProducts();
  }

  async function updateProduct(index) {
    const p = products[index];
    setSavingId(p._id);
    try {
      await axios.put(`${API}/products/${p._id}`, p, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      setSavingId(null);
    }
  }

  async function deleteProduct(index) {
    if (!window.confirm("Delete this product? This can't be undone.")) return;
    const id = products[index]._id;
    await axios.delete(`${API}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  }

  async function handleCsvImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/products/import`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImportMessage(`Imported ${res.data.count} products.`);
      loadProducts();
    } catch (err) {
      setImportMessage(err?.response?.data?.error || "Import failed. Check your CSV format.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  function edit(index, field, value) {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  }

  function editDesc(index, field, value) {
    const updated = [...products];
    updated[index] = {
      ...updated[index],
      description: { ...updated[index].description, [field]: value },
    };
    setProducts(updated);
  }

  const outOfStockCount = products.filter((p) => (p.stock ?? 0) <= 0).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;

  return (
    <>
      <div className="admin-stat-row">
        <div className="admin-stat">
          <div className="admin-stat-value">{products.length}</div>
          <div className="admin-stat-label">Total products</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{lowStockCount}</div>
          <div className="admin-stat-label">Low stock (≤5)</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{outOfStockCount}</div>
          <div className="admin-stat-label">Out of stock</div>
        </div>
      </div>

      <div className="admin-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showAddForm ? "16px" : 0 }}>
          <strong>Bulk import from CSV</strong>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm((s) => !s)}>
            {showAddForm ? "Close" : "+ Add product manually"}
          </button>
        </div>
        <p style={{ margin: "6px 0", fontSize: "13px" }}>
          Columns: title, sku, category, price, stock, img. See <code>backend/sample-products-template.csv</code> for a starter file.
        </p>
        <input type="file" accept=".csv" onChange={handleCsvImport} disabled={importing} />
        {importing && <p style={{ fontSize: "13px" }}>Importing…</p>}
        {importMessage && <p style={{ fontSize: "13px" }}>{importMessage}</p>}

        {showAddForm && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <div className="admin-form-grid">
              <input placeholder="Title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} />
              <input placeholder="SKU" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
              <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
              <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
              <input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} />
              <input placeholder="Image URL" value={newProduct.img} onChange={(e) => setNewProduct({ ...newProduct, img: e.target.value })} />
            </div>
            <textarea
              placeholder="Overview"
              className="field-input"
              style={{ marginTop: "10px", minHeight: "70px" }}
              value={newProduct.description.overview}
              onChange={(e) => setNewProduct({ ...newProduct, description: { ...newProduct.description, overview: e.target.value } })}
            />
            <button className="btn btn-primary" onClick={saveNewProduct}>Save product</button>
          </div>
        )}
      </div>

      <div className="admin-panel" style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price (₦)</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <Fragment key={p._id}>
                  <tr>
                    <td><img src={p.img || "https://via.placeholder.com/40"} alt="" className="admin-table-img" loading="lazy" decoding="async" /></td>
                    <td><input value={p.title} onChange={(e) => edit(i, "title", e.target.value)} /></td>
                    <td><input value={p.sku || ""} onChange={(e) => edit(i, "sku", e.target.value)} /></td>
                    <td><input value={p.category || ""} onChange={(e) => edit(i, "category", e.target.value)} /></td>
                    <td><input type="number" value={p.price} onChange={(e) => edit(i, "price", Number(e.target.value))} /></td>
                    <td><input type="number" value={p.stock ?? 0} onChange={(e) => edit(i, "stock", Number(e.target.value))} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}>
                          {expandedId === p._id ? "Close" : "Details"}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => updateProduct(i)} disabled={savingId === p._id}>
                          {savingId === p._id ? "Saving…" : "Save"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(i)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === p._id && (
                    <tr>
                      <td colSpan={7} style={{ background: "var(--silkscreen)" }}>
                        <div style={{ padding: "12px 4px" }}>
                          <label className="field-label">Image URL</label>
                          <input className="field-input" value={p.img || ""} onChange={(e) => edit(i, "img", e.target.value)} />

                          <label className="field-label">Overview</label>
                          <textarea
                            className="field-input"
                            style={{ minHeight: "70px" }}
                            value={p.description.overview}
                            onChange={(e) => editDesc(i, "overview", e.target.value)}
                          />

                          <label className="field-label">Features (one per line)</label>
                          <textarea
                            className="field-input"
                            style={{ minHeight: "70px" }}
                            value={p.description.features.join("\n")}
                            onChange={(e) => editDesc(i, "features", e.target.value.split("\n"))}
                          />

                          <label className="field-label">Applications (one per line)</label>
                          <textarea
                            className="field-input"
                            style={{ minHeight: "70px" }}
                            value={p.description.applications.join("\n")}
                            onChange={(e) => editDesc(i, "applications", e.target.value.split("\n"))}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
