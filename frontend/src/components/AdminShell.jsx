import { Link, useLocation, useNavigate } from "react-router-dom";

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin";

export default function AdminShell({ title, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("dt_token");
    navigate(ADMIN_PATH);
    window.location.reload();
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="brand-mark" />
          DTComponents
        </div>
        <nav className="admin-sidebar-nav">
          <Link to={ADMIN_PATH} className={isActive(ADMIN_PATH) ? "active" : ""}>Products</Link>
          <Link to={`${ADMIN_PATH}/orders`} className={isActive(`${ADMIN_PATH}/orders`) ? "active" : ""}>Orders</Link>
          <Link to={`${ADMIN_PATH}/promotions`} className={isActive(`${ADMIN_PATH}/promotions`) ? "active" : ""}>Promotions</Link>
          <Link to={`${ADMIN_PATH}/projects`} className={isActive(`${ADMIN_PATH}/projects`) ? "active" : ""}>Projects</Link>
        </nav>
        <button className="btn btn-secondary btn-sm admin-sidebar-logout" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="admin-content">
        {title && <h2 className="section-title" style={{ marginBottom: "24px" }}>{title}</h2>}
        {children}
      </main>
    </div>
  );
}
