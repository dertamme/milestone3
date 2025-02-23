import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

  // Load the cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeItem = (product_id) => {
    const updatedCart = cartItems.filter(
      (item) => item.product_id !== product_id
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.product_id}>
              <strong>{item.name}</strong> (x{item.quantity || 1}) - $
              {item.price}
              <button onClick={() => removeItem(item.product_id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <Link to='/checkout'>
          <button>Proceed to Checkout</button>
        </Link>
      )}
    </div>
  );
}
