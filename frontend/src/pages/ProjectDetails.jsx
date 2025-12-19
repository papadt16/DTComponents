import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProjectDetails() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);

useEffect(() => {
  axios.get(`${API}/projects/${slug}`).then((res) => {
    setProject(res.data);
  });
}, [slug]);

  if (!project) {
    return <p style={{ padding: 40 }}>Project not found</p>;
  }

  return (
    <div style={page}>
      <h1 style={title}>{project.title}</h1>

      {/* OVERVIEW */}
      <Section title="Overview">
        <p>{project.overview}</p>
      </Section>

      {/* FEATURES */}
      <Section title="Key Features">
        <ul>
          {project.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Section>

      {/* COMPONENTS */}
      <Section title="Components Required">
        <ul>
          {project.components.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </Section>

      {/* SCHEMATIC */}
      <Section title="Schematic Diagram">
        <img src={project.schematic} alt="schematic" style={image} />
      </Section>

      {/* CODE */}
      <Section title="Source Code">
        <pre style={codeBox}>{project.code}</pre>
      </Section>

      {/* EXPLANATION */}
      <Section title="Code Explanation">
        <ol>
          {project.explanation.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

const projects = {
  "smart-home-automation": {
    title: "Smart Home Automation",
    overview:
      "This project allows you to control home appliances remotely using ESP32 and relay modules.",
    features: [
      "Remote appliance control",
      "WiFi-enabled ESP32",
      "Low power design",
    ],
    components: [
      "ESP32 Dev Board",
      "5V Relay Module",
      "Bulb",
      "Jumper Wires",
      "Power Supply",
    ],
    schematic:
      "https://i.imgur.com/8Km9tLL.png",
    code: `
#define RELAY 2

void setup() {
  pinMode(RELAY, OUTPUT);
}

void loop() {
  digitalWrite(RELAY, HIGH);
  delay(2000);
  digitalWrite(RELAY, LOW);
  delay(2000);
}
`,
    explanation: [
      "ESP32 initializes the relay pin",
      "Relay toggles ON and OFF",
      "Delay controls switching time",
    ],
  },
};

/* ===== REUSABLE SECTION ===== */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

/* ===== STYLES ===== */

const page = {
  padding: "50px",
  maxWidth: "900px",
  margin: "auto",
  color: "white",
};

const title = {
  fontSize: "36px",
  fontWeight: "bold",
};

const sectionTitle = {
  fontSize: "22px",
  marginBottom: 10,
  borderBottom: "2px solid #334155",
  paddingBottom: 6,
};

const image = {
  width: "100%",
  maxWidth: "600px",
  marginTop: 10,
};

const codeBox = {
  background: "#020617",
  padding: "20px",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "14px",
};
