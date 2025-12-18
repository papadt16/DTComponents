import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://dtcomponents-backend.onrender.com";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    axios.get(`${API}/products/${id}`).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("dt_cart")) || [];

    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        _id: product._id,
        title: product.title,
        price: product.price,
        img: product.img,
        qty,
      });
    }

    localStorage.setItem("dt_cart", JSON.stringify(cart));
    alert("Added to cart");
  }

  if (!product) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={page}>
      <div style={container}>
        <img src={product.img} alt={product.title} style={image} />

        <div style={info}>
          <h2>{product.title}</h2>
          <p style={price}>₦{product.price}</p>

          <p style={desc}>
            {product.description || "No description provided."}
          </p>

          <div style={qtyBox}>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          <button style={btn} onClick={addToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */

const page = {
  padding: "40px",
};

const container = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};

const image = {
  width: "100%",
  maxHeight: "400px",
  objectFit: "contain",
};

const info = {
  display: "flex",
  flexDirection: "column",
};

const price = {
  fontSize: "22px",
  fontWeight: "bold",
  margin: "10px 0",
};

const desc = {
  color: "#475569",
  lineHeight: 1.6,
};

const qtyBox = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  margin: "20px 0",
};

const btn = {
  padding: "12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
