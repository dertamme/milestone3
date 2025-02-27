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
  TextField,
  Box,
} from "@mui/material";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // remove entire product from cart
  const removeItem = (product_id) => {
    const updatedCart = cartItems.filter(
      (item) => item.product_id !== product_id
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // handle quantity changes
  const handleQuantityChange = (product_id, newQty) => {
    // parse and clamp the new quantity
    let qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) {
      qty = 1; // ensure at least 1
    }

    const updatedCart = cartItems.map((item) => {
      if (item.product_id === product_id) {
        return { ...item, quantity: qty };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // total cost calculation
  const totalCost = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4'>Shopping Cart</Typography>

      {cartItems.length === 0 ? (
        <Typography variant='h6' sx={{ mt: 2 }}>
          Your cart is empty.
        </Typography>
      ) : (
        <Paper sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.name}</TableCell>

                  {/* Quantity input */}
                  <TableCell>
                    <TextField
                      type='number'
                      variant='outlined'
                      size='small'
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.product_id, e.target.value)
                      }
                      inputProps={{ min: 1, style: { width: "60px" } }}
                    />
                  </TableCell>

                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
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
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Total: ${totalCost.toFixed(2)}</Typography>
          <Button
            variant='contained'
            sx={{ mt: 2 }}
            component={Link}
            to='/checkout'
          >
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Container>
  );
}
