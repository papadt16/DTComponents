import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminProjects from "./pages/AdminProjects.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import OrderHistoryPage from "./pages/OrderHistoryPage.jsx";

export default function App() {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("dt_cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("dt_cart", JSON.stringify(newCart));
  };

  const loadOrderIntoCart = (items) => {
    updateCart(items);
  };

  return (
    <>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>DTComponents</Link>
        <div>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/shop" style={linkStyle}>Shop</Link>
          <Link to="/cart" style={linkStyle}>Cart</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        <Route
          path="/cart"
          element={<CartPage cart={cart} updateCart={updateCart} />}
        />

        <Route
          path="/orders"
          element={<OrderHistoryPage loadOrderIntoCart={loadOrderIntoCart} />}
        />

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



