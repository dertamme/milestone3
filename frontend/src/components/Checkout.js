import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const paypalRef = useRef(null);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Calculate total cost
  const totalCost = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Call the backend to create the order (always PayPal in this scenario)
  const createOrderInBackend = useCallback(() => {
    const orderData = {
      user_id: 1, // Hard-coded user for testing
      payment_method: "PayPal",
      cart_items: cartItems,
    };

    console.log("Creating order in backend with:", orderData);

    return fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Order creation failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        alert(`Order placed successfully! Order ID: ${data.order_id}`);
        // Clear cart
        localStorage.removeItem("cart");
        setCartItems([]);
        // Navigate away (e.g., back home or to a confirmation page)
        navigate("/");
      })
      .catch((error) => {
        alert(`Error placing order: ${error.message}`);
      });
  }, [cartItems, navigate]);

  // Render PayPal button if cart isn't empty
  useEffect(() => {
    if (cartItems.length > 0 && window.paypal && paypalRef.current) {
      window.paypal
        .Buttons({
          createOrder: (_data, actions) => {
            // Set up the PayPal transaction
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: totalCost.toFixed(2) },
                },
              ],
            });
          },
          onApprove: async (_data, actions) => {
            // Capture the funds from the transaction
            const details = await actions.order.capture();
            console.log("PayPal Payment Approved:", details);

            // Finalize order in the backend
            createOrderInBackend();
          },
          onError: (err) => {
            console.error("PayPal Checkout Error:", err);
            alert("There was an error with PayPal payment.");
          },
        })
        .render(paypalRef.current);
    }
  }, [cartItems, totalCost, createOrderInBackend]);

  return (
    <div>
      <h2>Checkout</h2>

      {/* If cart is empty, show message */}
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <h3>Order Summary</h3>
          <ul>
            {cartItems.map((item) => (
              <li key={item.product_id}>
                {item.name} (x{item.quantity || 1}) - ${item.price}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: ${totalCost.toFixed(2)}</strong>
          </p>

          <h3>PayPal Payment</h3>
          <div ref={paypalRef} />
        </>
      )}
    </div>
  );
}
