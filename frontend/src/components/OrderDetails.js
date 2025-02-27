import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function OrderDetails({ open, handleClose, order }) {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent>
        {order ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant='h6'>Order Information</Typography>
            <Typography>
              <strong>Order ID:</strong> {order.order_id}
            </Typography>
            <Typography>
              <strong>Customer ID:</strong> {order.customer_id}
            </Typography>
            <Typography>
              <strong>Status:</strong> {order.status}
            </Typography>
            <Typography>
              <strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Payment Method:</strong> {order.payment_method}
            </Typography>
            <Typography>
              <strong>Created At:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant='h6'>Order Items</Typography>
              <TableContainer component={Paper}>
                <Table aria-label='order items table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Product ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Quantity</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Price ($)</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.order_items.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>{item.product_id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
