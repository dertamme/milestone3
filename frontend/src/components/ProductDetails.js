import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function ProductDetails() {
  const { id } = useParams(); // Retrieve the product ID from the URL
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  const addToCart = () => {
    fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.product_id, quantity: 1 }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage("Product added to cart!");
        } else {
          setMessage("Failed to add product to cart.");
        }
      })
      .catch(() => setMessage("An error occurred while adding to cart."));
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={addToCart}>Add to Cart</button>
      {message && <p>{message}</p>}
    </div>
  );
}
