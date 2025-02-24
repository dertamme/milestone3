import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const paypalRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

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
        // Show success Snackbar
        setSnackbar({
          open: true,
          message: `Order placed successfully! Order ID: ${data.order_id}`,
          severity: "success",
        });
        // Clear cart
        localStorage.removeItem("cart");
        setCartItems([]);
        // Navigate after a short delay to allow users to see the message
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        // Show error Snackbar
        setSnackbar({
          open: true,
          message: `Error placing order: ${error.message}`,
          severity: "error",
        });
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
            // Show error Snackbar
            setSnackbar({
              open: true,
              message: "There was an error with PayPal payment.",
              severity: "error",
            });
          },
        })
        .render(paypalRef.current);
    }
  }, [cartItems, totalCost, createOrderInBackend]);

  // Handle Snackbar Close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
