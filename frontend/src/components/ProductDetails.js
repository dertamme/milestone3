import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  TextField,
} from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");

  // Local cart state from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // local quantity state for the user to pick how many they want
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    // parse quantity to ensure it's an integer > 0
    const qty = parseInt(quantity, 10) > 0 ? parseInt(quantity, 10) : 1;

    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );
    let updatedCart;

    if (existingItem) {
      // Increase the item’s quantity by the chosen amount
      updatedCart = cart.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + qty }
          : item
      );
    } else {
      // Add new product with the chosen quantity
      updatedCart = [...cart, { ...product, quantity: qty }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setMessage(`Added ${qty} to cart!`);
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        {product.img_url && (
          <Box>
            <img
              src={product.img_url}
              alt={product.name}
              style={{ maxWidth: "100%", height: "auto", margin: "1rem 0" }}
            />
          </Box>
        )}

        <Typography variant='h4'>{product.name}</Typography>

        {product.category_name && (
          <Typography variant='subtitle1' sx={{ mt: 1 }}>
            Category: {product.category_name}
          </Typography>
        )}

        <Typography variant='body1' sx={{ mt: 2 }}>
          {product.description}
        </Typography>
        <Typography variant='h5' sx={{ mt: 2 }}>
          ${product.price}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {/* New: quantity input */}
          <TextField
            label='Quantity'
            type='number'
            variant='outlined'
            size='small'
            sx={{ mr: 2 }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <Button variant='contained' onClick={addToCart}>
            Add to Cart
          </Button>
          {message && (
            <Typography color='success.main' sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
