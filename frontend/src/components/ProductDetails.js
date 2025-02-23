import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function ProductDetails() {
  const { id } = useParams(); // Retrieve the product ID from the URL
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");

  // Load cart from localStorage or default to an empty array
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    // Check if product already exists in the cart
    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );

    let updatedCart;
    if (existingItem) {
      // Increase quantity if it already exists
      updatedCart = cart.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Add new product to the cart
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setMessage("Product added to cart!");
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
