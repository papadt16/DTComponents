import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminProjects from "./pages/AdminProjects.jsx";
import ProjectDetails from "./pages/ProjectDetails";
import ProductDetails from "./pages/ProductDetails.jsx";


export default function App() {
  return (
    <>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>DTComponents</Link>
        <div>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/shop" style={linkStyle}>Shop</Link>
          <Link to="/cart" style={linkStyle}>Cart</Link>
          {/* ❌ Admin link REMOVED */}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/projects/:slug" element={<ProjectDetails />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
      </Routes>
    </>
  );
}

/* ===== ADMIN PROTECTION ===== */
function ProtectedAdmin() {
  const pass = prompt("Admin access only");

  if (pass !== "Emmanuel1234$") {
    window.location.href = "/";
    return null;
  }

  return <AdminPage />;
}

/* ===== STYLES ===== */

const navStyle = {
  padding: "15px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#0f172a",
  color: "white",
};

const logoStyle = {
  fontWeight: "bold",
  fontSize: "20px",
  color: "white",
  textDecoration: "none",
};

const linkStyle = {
  marginLeft: "20px",
  color: "white",
  textDecoration: "none",
};



