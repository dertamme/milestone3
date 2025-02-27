// src/components/OrderManagement.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  TextField,
  Pagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import OrderDetails from "./OrderDetails";
import { API_URL } from "../config";

export default function OrderManagement() {
  // State variables
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Items per page

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Dialog state for updating status
  const [dialog, setDialog] = useState({
    open: false,
    order: null,
    newStatus: "",
  });

  // Dialog state for viewing details
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    order: null,
  });

  // Fetch orders on component mount and when page or searchTerm changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // Function to fetch orders with pagination and search
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/orders?page=${currentPage}&per_page=${perPage}`;
      // Assuming backend supports search by order_id or customer_id via query params
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }
      const data = await response.json();
      setOrders(data.orders || data); // Adjust based on backend response
      setTotalPages(data.pages || 1);
      setLoading(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
      setLoading(false);
    }
  };

  // Function to handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Function to handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Function to handle opening the update status dialog
  const handleOpenUpdateDialog = (order) => {
    setDialog({
      open: true,
      order: order,
      newStatus: order.status,
    });
  };

  // Function to handle closing the update status dialog
  const handleCloseUpdateDialog = () => {
    setDialog({
      open: false,
      order: null,
      newStatus: "",
    });
  };

  // Function to handle opening the details dialog
  const handleOpenDetailsDialog = (order) => {
    setDetailsDialog({
      open: true,
      order: order,
    });
  };

  // Function to handle closing the details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialog({
      open: false,
      order: null,
    });
  };

  // Function to handle status change
  const handleStatusChange = (e) => {
    setDialog((prev) => ({
      ...prev,
      newStatus: e.target.value,
    }));
  };

  // Function to submit status update
  const handleSubmitStatusUpdate = async () => {
    const { order, newStatus } = dialog;

    if (!newStatus) {
      setSnackbar({
        open: true,
        message: "Please select a new status.",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/orders/${order.order_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status.");
      }

      // Success
      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });

      // Refresh orders
      fetchOrders();

      // Close dialog
      handleCloseUpdateDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  // Function to handle deleting an order
  const handleDeleteOrder = async (order_id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/${order_id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order.");
      }

      // Success
      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  // Function to handle closing the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Allowed statuses for update
  const allowedStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' align='center' gutterBottom>
        Order Management
      </Typography>

      {/* Search Bar */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <TextField
          label='Search by Order ID or Customer ID'
          variant='outlined'
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "60%" }}
        />
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box display='flex' justifyContent='center' mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table aria-label='orders table'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Order ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Customer ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Total Amount ($)</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Payment Method</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created At</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell>{order.order_id}</TableCell>
                      <TableCell>{order.customer_id}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{order.payment_method}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title='View Details'>
                          <IconButton
                            color='primary'
                            onClick={() => handleOpenDetailsDialog(order)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Update Status'>
                          <IconButton
                            color='secondary'
                            onClick={() => handleOpenUpdateDialog(order)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete Order'>
                          <IconButton
                            color='error'
                            onClick={() => handleDeleteOrder(order.order_id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box display='flex' justifyContent='center' mt={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        </>
      )}

      {/* Dialog for Updating Order Status */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseUpdateDialog}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box
            component='form'
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <Typography>
              <strong>Order ID:</strong> {dialog.order?.order_id}
            </Typography>
            <Typography>
              <strong>Current Status:</strong> {dialog.order?.status}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id='status-select-label'>New Status</InputLabel>
              <Select
                labelId='status-select-label'
                label='New Status'
                value={dialog.newStatus}
                onChange={handleStatusChange}
              >
                {allowedStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitStatusUpdate}
            variant='contained'
            color='primary'
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Viewing Order Details */}
      <OrderDetails
        open={detailsDialog.open}
        handleClose={handleCloseDetailsDialog}
        order={detailsDialog.order}
      />

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
