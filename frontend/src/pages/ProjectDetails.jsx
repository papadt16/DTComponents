import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../utils/api.js";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("c", c);

const WHATSAPP_NUMBER = "2349038899075";

// Component lines look like "2. BC547 Transistors (8 no)" or
// "HC-SR04 Ultrasonic Sensor (2 no, one per compartment)" — strip the
// leading numbering and any trailing quantity note so what's left is a
// clean search term for the shop catalog. A leading digit inside the
// parens is what distinguishes a quantity note ("(8 no)") from a
// meaningful part of the name ("(I2C)"), which we want to keep.
function cleanComponentName(raw) {
  return raw
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*\(\d+[^)]*\)\s*$/, "")
    .trim();
}

async function findMatchingProduct(cleanedName) {
  const words = cleanedName.split(/\s+/).filter(Boolean);
  const attempts = [cleanedName, words.slice(0, 2).join(" "), words[0]].filter(Boolean);

  for (const term of attempts) {
    try {
      const res = await axios.get(`${API}/products`, { params: { search: term } });
      if (res.data.length > 0) return res.data[0];
    } catch {
      // network hiccup on this attempt — try the next, shorter term
    }
  }
  return null;
}

export default function ProjectDetails({ cart, updateCart }) {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [itemStatus, setItemStatus] = useState({}); // index -> "added" | "not-found" | "checking"
  const [bulkStatus, setBulkStatus] = useState("");

  useEffect(() => {
    setProject(null);
    setNotFound(false);
    setItemStatus({});
    setBulkStatus("");

    axios
      .get(`${API}/projects/${slug}`)
      .then((res) => setProject(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  function addProductToCart(product, cartSnapshot = cart) {
    const existing = cartSnapshot.find((item) => item._id === product._id);
    let next;
    if (existing) {
      next = cartSnapshot.map((item) => (item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      next = [...cartSnapshot, { _id: product._id, title: product.title, price: product.price, img: product.img, qty: 1 }];
    }
    updateCart(next);
    return next;
  }

  async function handleAddComponent(rawText, index) {
    setItemStatus((s) => ({ ...s, [index]: "checking" }));
    const product = await findMatchingProduct(cleanComponentName(rawText));
    if (product) {
      addProductToCart(product);
      setItemStatus((s) => ({ ...s, [index]: "added" }));
    } else {
      setItemStatus((s) => ({ ...s, [index]: "not-found" }));
    }
  }

  async function handleAddAllComponents() {
    setBulkStatus("Checking components…");
    let addedCount = 0;
    const missing = [];
    const nextStatus = {};
    // Accumulate locally across the loop instead of relying on `cart`
    // state — updateCart calls are async, so reading `cart` again on the
    // next iteration would still see the stale pre-loop value and each
    // call would clobber the previous addition instead of stacking.
    let cartDraft = cart;

    for (let i = 0; i < project.components.length; i++) {
      const raw = project.components[i];
      const product = await findMatchingProduct(cleanComponentName(raw));
      if (product) {
        cartDraft = addProductToCart(product, cartDraft);
        nextStatus[i] = "added";
        addedCount++;
      } else {
        nextStatus[i] = "not-found";
        missing.push(cleanComponentName(raw));
      }
    }

    setItemStatus(nextStatus);

    if (missing.length === 0) {
      setBulkStatus(`All ${addedCount} components added to cart.`);
    } else {
      setBulkStatus(
        `${addedCount} of ${project.components.length} components added to cart. ${missing.length} not currently stocked — message us on WhatsApp for those.`
      );
    }
  }

  function whatsappLinkFor(componentName) {
    const msg = `Hi DTComponents, do you have this in stock: ${componentName}? (For the "${project?.title}" project)`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  if (notFound) {
    return (
      <div style={page}>
        <h1 style={title}>Project not found</h1>
        <p>This build may have been removed or renamed.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 16, display: "inline-block" }}>
          Back to home
        </Link>
      </div>
    );
  }

  if (!project) {
    return <p style={{ padding: 40 }}>Loading project...</p>;
  }

  return (
    <div style={page}>
      <h1 style={title}>{project.title}</h1>
      {project.difficulty && <p style={difficultyBadge}>{project.difficulty}</p>}

      <Section title="Overview">
        <p>{project.overview}</p>
      </Section>

      {project.features?.length > 0 && (
        <Section title="Key Features">
          <ul>
            {project.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      )}

      {project.components?.length > 0 && (
        <Section title="Components Required">
          <button className="btn btn-primary btn-sm" onClick={handleAddAllComponents} style={{ marginBottom: 14 }}>
            Add all available components to cart
          </button>
          {bulkStatus && <p style={bulkStatusText}>{bulkStatus}</p>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {project.components.map((comp, i) => (
              <li key={i} style={componentRow}>
                <span>{comp}</span>
                {itemStatus[i] === "added" && <span style={{ color: "var(--signal-dark)", fontSize: 13, fontWeight: 600 }}>Added ✓</span>}
                {itemStatus[i] === "checking" && <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Checking…</span>}
                {itemStatus[i] === "not-found" && (
                  <a href={whatsappLinkFor(cleanComponentName(comp))} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>
                    Not in stock — ask on WhatsApp
                  </a>
                )}
                {!itemStatus[i] && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleAddComponent(comp, i)}>
                    Add to cart
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {project.schematic && (
        <Section title="Schematic Diagram">
          <img src={project.schematic} alt="schematic" style={image} />
        </Section>
      )}

      {project.code && (
        <Section title="Source Code">
          <SyntaxHighlighter
            language="c"
            style={oneDark}
            customStyle={{ borderRadius: "8px", fontSize: "14px", padding: "20px" }}
          >
            {project.code}
          </SyntaxHighlighter>
        </Section>
      )}

      {project.explanation?.length > 0 && (
        <Section title="Explanation">
          {project.explanation.map((step, i) => (
            <div key={i} style={explanationBlock}>
              <h3 style={stepTitle}>{step.title}</h3>
              {step.img && <img src={step.img} alt={step.title} style={explanationImage} />}
              {Array.isArray(step.text) ? (
                step.text.map((line, j) => (
                  <p key={j} style={explanationText}>{line}</p>
                ))
              ) : (
                <p style={explanationText}>{step.text}</p>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

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
  color: "black",
};

const title = {
  fontSize: "36px",
  fontWeight: "bold",
};

const difficultyBadge = {
  display: "inline-block",
  marginTop: 8,
  padding: "4px 12px",
  borderRadius: "999px",
  background: "var(--copper-tint)",
  color: "var(--copper-dark)",
  fontSize: "13px",
  fontWeight: 600,
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

const componentRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "10px 0",
  borderBottom: "1px solid #e5e5e5",
};

const bulkStatusText = {
  fontSize: "14px",
  color: "#444",
  marginBottom: "12px",
};

const explanationBlock = {
  marginBottom: "50px",
};

const stepTitle = {
  fontSize: "20px",
  marginBottom: "15px",
  color: "black",
};

const explanationImage = {
  width: "100%",
  maxWidth: "700px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const explanationText = {
  marginBottom: "18px",
  lineHeight: "1.7",
  color: "black",
};
