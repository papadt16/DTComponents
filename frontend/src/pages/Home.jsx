import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";

const WHATSAPP_NUMBER = "2349038899075";

const CATEGORY_NODES = [
  "Microcontrollers",
  "Sensors",
  "Power & Batteries",
  "Passive Components",
  "Modules",
  "Tools",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [promo, setPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/promotions/featured`)
      .then((res) => setPromo(res.data))
      .catch(() => setPromo(null));
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
          <div className="hero-eyebrow-row">Electronic components, shipped fast</div>
          <h1 className="hero-title">Find any component instantly</h1>
          <p className="hero-sub">
            Microcontrollers, sensors, modules, and passives for your next build —
            search the catalog or browse by category below.
          </p>

          <form onSubmit={handleSearch} className="hero-search">
            <input
              placeholder="Search for ESP32, resistor, sensor, IC..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                  <p>{p.description}</p>
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

const projects = [
  {
    slug: "smart-home-automation",
    title: "Smart Home Automation",
    description: "Control lights and appliances remotely using ESP32 and relays.",
    image: "https://content.instructables.com/FQT/SEJB/KJEAG18Z/FQTSEJBKJEAG18Z.jpg?auto=webp&frame=1&crop=3:2&width=900&height=1024&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNDo0OC4w",
  },
  {
    slug: "iot-weather-station",
    title: "IoT Weather Station",
    description: "Monitor temperature, humidity and pressure with live cloud updates.",
    image: "https://th.bing.com/th/id/OIP.iPOBJH26k9zEPDEbN11jLAHaEL?w=315&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1",
  },
  {
    slug: "line-following-robot",
    title: "Line Following Robot",
    description: "A prototype capable of autonomously following complex line paths.",
    image: "https://th.bing.com/th/id/OIP.bz3FN8l2mJcXddudyt8MOQHaE8?w=239&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1",
  },
  {
    slug: "smart-queue-system",
    title: "Smart Queue Management",
    description: "Token-based customer queue system with display and buzzer alerts.",
    image: "https://microcontrollerslab.com/wp-content/uploads/2020/04/FreeRTOS-queue-example-with-LCD-and-ADC-circuit-diagram.jpg",
  },
];
