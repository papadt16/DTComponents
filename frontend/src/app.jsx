import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import CartPage from "./pages/CartPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <>
      <nav style={navStyle}>
        <Link to="/" style={logoStyle}>DTComponents</Link>
        <div>
          <Link to="/shop" style={linkStyle}>Shop</Link>
          <Link to="/cart" style={linkStyle}>Cart</Link>
          <Link to="/admin" style={linkStyle}>Admin</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

const navStyle = {
  padding: "15px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#0f172a",
  color: "white"
};

const logoStyle = {
  fontWeight: "bold",
  fontSize: "20px",
  color: "white",
  textDecoration: "none"
};

const linkStyle = {
  marginLeft: "20px",
  color: "white",
  textDecoration: "none"
};
