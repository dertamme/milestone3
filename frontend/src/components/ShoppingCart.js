import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/cart`)
      .then((res) => res.json())
      .then((data) => setCartItems(data));
  }, []);

  const handleQuantityChange = (id, quantity) => {
    fetch(`${API_URL}/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    }).then(() => {
      setCartItems((items) =>
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    });
  };

  const handleRemove = (id) => {
    fetch(`${API_URL}/cart/${id}`, { method: "DELETE" }).then(() => {
      setCartItems((items) => items.filter((item) => item.id !== id));
    });
  };

  if (cartItems.length === 0) {
    return (
      <p>
        Your cart is empty. <Link to='/'>Start shopping!</Link>
      </p>
    );
  }

  return (
    <div>
      <h2>Shopping Cart</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <input
              type='number'
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.id, parseInt(e.target.value, 10))
              }
            />
            <button onClick={() => handleRemove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <Link to='/checkout'>Proceed to Checkout</Link>
    </div>
  );
}
