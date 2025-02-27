import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Button, Paper, Box } from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");

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

    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setMessage("Product added to cart!");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* If product has an image */}
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

        {/* Show the category name if present */}
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
