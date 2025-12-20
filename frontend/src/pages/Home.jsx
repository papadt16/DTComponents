import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <>
      {/* ===== HERO ===== */}
      <div style={container}>
        <div style={overlay}>
          <h1 style={title}>DTComponents</h1>
          <p style={subtitle}>Find any electronic component instantly</p>

          <form onSubmit={handleSearch} style={searchBox}>
            <input
              placeholder="Search for ESP32, resistor, sensor, IC..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={input}
            />
            <button style={button}>Search</button>
          </form>
        </div>
      </div>

      {/* ===== FEATURED PROJECTS ===== */}
      <section style={projectsSection}>
        <h2 style={sectionTitle}>Featured IoT Projects</h2>
        <p style={sectionSubtitle}>
          Learn, build, and deploy real-world electronics projects
        </p>

        <div style={projectsGrid}>
          {projects.map((p) => (
            <div
              key={p.slug}
              style={projectCard}
              onClick={() => navigate(`/projects/${p.slug}`)}
            >
              <img src={p.image} alt={p.title} style={projectImage} />
              <h3>{p.title}</h3>
              <p style={projectDesc}>{p.description}</p>
              <button style={projectBtn}>View Project</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ===== STATIC PROJECT DATA (TEMP) ===== */

const projects = [
  {
    slug: "smart-home-automation",
    title: "Smart Home Automation",
    description:
      "Control lights and appliances remotely using ESP32 and relays.",
    image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e",
  },
  {
    slug: "iot-weather-station",
    title: "IoT Weather Station",
    description:
      "Monitor temperature, humidity and pressure with live cloud updates.",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
  },
  {
    slug: "rfid-attendance-system",
    title: "RFID Attendance System",
    description:
      "Automated student/staff attendance tracking using RFID and Arduino.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
  },
  {
    slug: "smart-queue-system",
    title: "Smart Queue Management",
    description:
      "Token-based customer queue system with display and buzzer alerts.",
    image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e",
  },
];

/* ===== STYLES ===== */

const container = {
  minHeight: "100vh",
  backgroundColor: "black",
  backgroundImage:
    "url(https://plus.unsplash.com/premium_photo-1683120972279-87efe2ba252f?w=356&dpr=2&h=540&auto=format&fit=crop&q=60)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  textAlign: "center",
  padding: "20px",
};

const title = {
  fontSize: "48px",
  fontWeight: "bold",
};

const subtitle = {
  marginTop: "10px",
  fontSize: "18px",
  opacity: 0.9,
};

const searchBox = {
  marginTop: "30px",
  display: "flex",
  width: "100%",
  maxWidth: "600px",
};

const input = {
  flex: 1,
  padding: "14px",
  fontSize: "16px",
  border: "none",
  outline: "none",
};

const button = {
  padding: "14px 24px",
  fontSize: "16px",
  background: "#22c55e",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

/* ===== PROJECTS ===== */

const projectsSection = {
  padding: "80px 40px",
  background: "#020617",
  color: "white",
};

const sectionTitle = {
  fontSize: "32px",
  textAlign: "center",
};

const sectionSubtitle = {
  textAlign: "center",
  color: "#94a3b8",
  marginTop: 10,
  marginBottom: 50,
};

const projectsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "30px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const projectCard = {
  background: "#0f172a",
  borderRadius: "12px",
  padding: "20px",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

const projectImage = {
  width: "100%",
  height: "160px",
  objectFit: "cover",
  borderRadius: "8px",
  marginBottom: "15px",
};

const projectDesc = {
  fontSize: "14px",
  color: "#cbd5f5",
  margin: "10px 0",
};

const projectBtn = {
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
