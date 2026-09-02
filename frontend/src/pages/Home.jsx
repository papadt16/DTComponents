import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";
import SearchPreview from "../components/SearchPreview.jsx";
import HeroCircuitAnimation from "../components/HeroCircuitAnimation.jsx";

const WHATSAPP_NUMBER = "2349038899075";

const CATEGORY_NODES = [
  "Microcontrollers",
  "Sensors",
  "Power & Batteries",
  "Passive Components",
  "Modules",
  "Tools",
];

function truncate(text, max = 110) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [promo, setPromo] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/promotions/featured`)
      .then((res) => setPromo(res.data))
      .catch(() => setPromo(null));

    axios
      .get(`${API}/projects`)
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  }

  const whatsappMsg = encodeURIComponent(
    "Hey DTComponents, I couldn't find the component I was looking for. The component I need is: [Type component name here]"
  );

  return (
    <>
      <div className="help-banner">
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
          Can't find a component? Tell us on WhatsApp and we'll source it
        </a>
      </div>

      {promo && (
        <div className="promo-banner">
          <span className="badge badge-promo">{promo.code}</span>
          <span>
            {promo.discountType === "percentage"
              ? `${promo.discountValue}% off`
              : `₦${promo.discountValue.toLocaleString()} off`}
            {promo.description ? ` — ${promo.description}` : " your order"}
          </span>
          <Link to="/shop" className="promo-banner-link">Shop now</Link>
        </div>
      )}

      {/* ===== HERO — styled as a schematic / bench-instrument search ===== */}
      <div className="hero">
        <div className="hero-inner">
          <HeroCircuitAnimation />
          <div className="hero-eyebrow-row">Electronic components, shipped fast</div>
          <h1 className="hero-title">Find any component instantly</h1>
          <p className="hero-sub">
            Microcontrollers, sensors, modules, and passives for your next build —
            search the catalog or browse by category below.
          </p>

          <form onSubmit={handleSearch} className="hero-search">
            <SearchPreview
              value={query}
              onChange={setQuery}
              placeholder="Search for ESP32, resistor, sensor, IC..."
            />
            <button className="btn btn-primary">Search</button>
          </form>

          <div className="hero-nodes">
            {CATEGORY_NODES.map((cat) => (
              <Link
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="hero-node"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured builds</h2>
              <p className="section-sub">Real projects made with parts from this store</p>
            </div>
          </div>

          <div className="project-grid">
            {projects.map((p) => (
              <div key={p.slug} className="project-card" onClick={() => navigate(`/projects/${p.slug}`)}>
                <img src={p.image} alt={p.title} className="project-card-img" loading="lazy" decoding="async" />
                <div className="project-card-body">
                  <h3>{p.title}</h3>
                  <p>{truncate(p.overview)}</p>
                  <button className="btn btn-secondary btn-sm">View project</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
