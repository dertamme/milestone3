import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const paypalRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Calculate total cost
  const totalCost = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Create order in backend
  const createOrderInBackend = useCallback(() => {
    const orderData = {
      user_id: 1, // Hardcoded test user
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
        // Navigate away (e.g., home or confirmation page)
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
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: totalCost.toFixed(2) },
                },
              ],
            });
          },
          onApprove: async (_data, actions) => {
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
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' align='center' gutterBottom>
          Checkout
        </Typography>

        {/* Loading State */}
        {loading ? (
          <Box display='flex' justifyContent='center' mt={3}>
            <CircularProgress />
          </Box>
        ) : cartItems.length === 0 ? (
          <Typography variant='h6' align='center'>
            Your cart is empty.
          </Typography>
        ) : (
          <>
            {/* Order Summary */}
            <Typography variant='h5' sx={{ mt: 2, mb: 2 }}>
              Order Summary
            </Typography>
            <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
              {cartItems.map((item) => (
                <Box
                  key={item.product_id}
                  display='flex'
                  justifyContent='space-between'
                  sx={{ mb: 1 }}
                >
                  <Typography variant='body1'>
                    {item.name} (x{item.quantity || 1})
                  </Typography>
                  <Typography variant='body1'>
                    ${item.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Box
                display='flex'
                justifyContent='space-between'
                sx={{ mt: 2, fontWeight: "bold" }}
              >
                <Typography variant='h6'>Total:</Typography>
                <Typography variant='h6'>${totalCost.toFixed(2)}</Typography>
              </Box>
            </Paper>

            {/* PayPal Button */}
            <Box mt={3} display='flex' justifyContent='center'>
              <div ref={paypalRef} />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}
