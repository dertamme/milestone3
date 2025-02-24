import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

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
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4'>Shopping Cart</Typography>

      {cartItems.length === 0 ? (
        <Typography variant='h6'>Your cart is empty.</Typography>
      ) : (
        <Paper sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <Button
                      variant='outlined'
                      color='error'
                      onClick={() => removeItem(item.product_id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {cartItems.length > 0 && (
        <Button
          variant='contained'
          sx={{ mt: 3 }}
          component={Link}
          to='/checkout'
        >
          Proceed to Checkout
        </Button>
      )}
    </Container>
  );
}
