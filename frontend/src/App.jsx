import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";

// Home loads eagerly since it's the entry point for most visitors — no
// benefit to code-splitting the page that loads first anyway.
import Home from "./pages/Home.jsx";

// Everything else is loaded on demand. This keeps the admin dashboard,
// jsPDF (cart/orders), and the syntax highlighter (project pages) out of
// the bundle a first-time shopper has to download just to browse products.
const Shop = lazy(() => import("./pages/Shop.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));
const AdminProjects = lazy(() => import("./pages/AdminProjects.jsx"));
const AdminOrders = lazy(() => import("./pages/AdminOrders.jsx"));
const AdminPromotions = lazy(() => import("./pages/AdminPromotions.jsx"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails.jsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage.jsx"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const WishlistPage = lazy(() => import("./pages/WishlistPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));

import { isLoggedIn, getCustomerProfile } from "./utils/auth.js";

// The admin URL itself is just a courtesy obscurity layer, configurable
// via env so it isn't the same guessable "/admin" for every visitor.
// Real protection is the backend login + JWT in AdminPage — this alone
// is never the security boundary.
const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin";

export default function App() {
  const [cart, setCart] = useState([]);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const location = useLocation();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("dt_cart") || "[]");
    setCart(storedCart);
  }, []);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [location.pathname]);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("dt_cart", JSON.stringify(newCart));
  };

  const loadOrderIntoCart = (items) => {
    updateCart(items);
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const isAdminRoute = location.pathname.startsWith(ADMIN_PATH);

  return (
    <>
      {!isAdminRoute && (
        <nav className="site-nav">
          <div className="site-nav-inner">
            <Link to="/" className="brand">
              <span className="brand-mark" />
              DTComponents
            </Link>
            <div className="nav-links">
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
              <Link to="/shop" className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}>Shop</Link>
              <Link to="/orders" className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}>Orders</Link>
              {loggedIn ? (
                <>
                  <Link to="/wishlist" className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""}`}>Wishlist</Link>
                  <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>Profile</Link>
                </>
              ) : (
                <Link to="/login" className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}>Sign in</Link>
              )}
              <Link to="/cart" className="nav-cart">
                Cart
                {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </nav>
      )}

      <Suspense fallback={<div className="container section">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop cart={cart} updateCart={updateCart} />} />
          <Route path="/product/:id" element={<ProductDetails updateCart={updateCart} cart={cart} />} />
          <Route path="/cart" element={<CartPage cart={cart} updateCart={updateCart} />} />
          <Route path="/orders" element={<OrderHistoryPage loadOrderIntoCart={loadOrderIntoCart} />} />
          <Route path="/orders/:id" element={<OrderDetailsPage loadOrderIntoCart={loadOrderIntoCart} />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/wishlist" element={<WishlistPage cart={cart} updateCart={updateCart} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects/:slug" element={<ProjectDetails cart={cart} updateCart={updateCart} />} />
          <Route path={`${ADMIN_PATH}/projects`} element={<AdminProjects />} />
          <Route path={`${ADMIN_PATH}/orders`} element={<AdminOrders />} />
          <Route path={`${ADMIN_PATH}/promotions`} element={<AdminPromotions />} />
          <Route path={ADMIN_PATH} element={<AdminPage />} />
        </Routes>
      </Suspense>

      {!isAdminRoute && (
        <footer className="site-footer">
          <div className="container">
            <div>
              <div className="footer-brand">DTComponents</div>
              <p style={{ maxWidth: "32ch", fontSize: "14px" }}>
                Electronic components, modules, and dev boards — sourced and shipped fast.
              </p>
            </div>
            <div className="footer-col">
              <h4>Shop</h4>
              <Link to="/shop">All components</Link>
              <Link to="/orders">Track an order</Link>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="https://wa.me/2340000000000" target="_blank" rel="noreferrer">WhatsApp us</a>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
