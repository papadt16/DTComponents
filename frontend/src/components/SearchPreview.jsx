import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api.js";

// Debounced live search preview: a small dropdown of matches shown right
// below the input as the person types. Shared by the Home hero search and
// the Shop page search bar so both behave the same way.
export default function SearchPreview({ value, onChange, inputClassName = "", placeholder = "" }) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products`, { params: { search: value } });
        setResults(res.data.slice(0, 6));
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timeout);
  }, [value]);

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(true);
  }

  function handleBlur() {
    // Small delay so a click on a dropdown item registers before it hides.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  function goToProduct(id) {
    setOpen(false);
    navigate(`/product/${id}`);
  }

  return (
    <div className="search-preview-wrap">
      <input
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {open && value.trim() && (
        <div className="search-preview-dropdown">
          {loading ? (
            <div className="search-preview-empty">Searching…</div>
          ) : results.length === 0 ? (
            <div className="search-preview-empty">No items match your search.</div>
          ) : (
            results.map((p) => (
              <button key={p._id} className="search-preview-item" onMouseDown={() => goToProduct(p._id)}>
                <img
                  className="search-preview-img"
                  src={p.img || "https://via.placeholder.com/40"}
                  alt=""
                  onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                />
                <span className="search-preview-title">{p.title}</span>
                <span className="search-preview-price">₦{Number(p.price).toLocaleString()}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
