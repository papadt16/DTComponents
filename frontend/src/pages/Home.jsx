import { useNavigate } from "react-router-dom";
import { useState } from "react"; 

const WHATSAPP_NUMBER = "2349038899075"; 

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  }

  const handleWhatsAppClick = () => {
    const msg = encodeURIComponent(
    "Hey DTComponents,%0A" +
    "I couldn’t find the component I was looking for.%0A" +
    "The component I need is:%0A" +
    "[Type component name here]";
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <>
       {/* ===== TOP WHATSAPP BANNER ===== */}
      <div style={whatsappBanner}>
        <a
          href={`https://wa.me/2349038899075?text=${encodeURIComponent(
           "Hey DTComponents,%0A" +
           "I couldn’t find the component I was looking for.%0A" +
           "The component I need is:%0A" +
           "[Type component name here]";
          );}`}
          target="_blank"
          rel="noopener noreferrer"
          style={bannerLink}
        >
          Couldn’t find a component? Click here to let us know what you were looking for
        </a>
      </div>
      
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
    image: "https://content.instructables.com/FQT/SEJB/KJEAG18Z/FQTSEJBKJEAG18Z.jpg?auto=webp&frame=1&crop=3:2&width=900&height=1024&fit=bounds&md=MjAyMS0wMS0wMSAyMDowNDo0OC4w",
  },
  {
    slug: "iot-weather-station",
    title: "IoT Weather Station",
    description:
      "Monitor temperature, humidity and pressure with live cloud updates.",
    image: "https://th.bing.com/th/id/OIP.iPOBJH26k9zEPDEbN11jLAHaEL?w=315&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1",
  },
  {
    slug: "line-following-robot",
    title: "Line Following Robot",
    description:
      "A prototype capable of autonomously following complex line paths.",
    image: "https://th.bing.com/th/id/OIP.bz3FN8l2mJcXddudyt8MOQHaE8?w=239&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1",
  },
  {
    slug: "smart-queue-system",
    title: "Smart Queue Management",
    description:
      "Token-based customer queue system with display and buzzer alerts.",
    image: "https://microcontrollerslab.com/wp-content/uploads/2020/04/FreeRTOS-queue-example-with-LCD-and-ADC-circuit-diagram.jpg",
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

const ctaText = {
  marginTop: "10px",
  fontSize: "16px",
  opacity: 0.9,
};

const ctaLink = {
  color: "#0ea5e9",
  textDecoration: "underline",
  cursor: "pointer",
};

const subtitle = {
  marginTop: "10px",
  fontSize: "18px",
  opacity: 0.9,
};

const searchBox = {
  marginTop: "20px",
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

const whatsappBanner = {
  width: "100%",
  padding: "10px 0",
  background: "#020617", // WhatsApp green
  textAlign: "center",
  fontWeight: "bold",
  color: "white",
  cursor: "pointer",
};

const bannerLink = {
  color: "white",
  textDecoration: "none",
  fontSize: "16px",
};

