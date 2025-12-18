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
  );
}

const container = {
  height: "90vh",
  backgroundImage:
    "url(https://plus.unsplash.com/premium_photo-1683120972279-87efe2ba252f?w=356&dpr=2&h=540&auto=format&fit=crop&q=60&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTd8fGNpcmN1aXQlMjBib2FyZHxlbnwwfHx8fDE3NjYwMTY5NTN8MA&ixlib=rb-4.1.0)",
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
  color: "black",
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




