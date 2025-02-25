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
  Button,
  CircularProgress,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import {
  fetchInventory,
  updateInventory,
  fetchLowStockInventory,
} from "../services/inventoryService";

export default function InventoryManagement() {
  // State variables
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Dialog state for editing inventory
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null,
    newStockLevel: "",
    newReorderLevel: "",
  });

  // Fetch inventory on component mount and when searchTerm changes
  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchInventory(searchTerm);
      setInventory(data);
      setLoading(false);

      // Optionally, fetch low stock items and display notifications
      const lowStockData = await fetchLowStockInventory();
      if (lowStockData.length > 0) {
        setSnackbar({
          open: true,
          message: "Some products are low in stock.",
          severity: "warning",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (product) => {
    setEditDialog({
      open: true,
      product: product,
      newStockLevel: product.stock_level,
      newReorderLevel: product.reorder_level,
    });
  };

  const handleEditDialogClose = () => {
    setEditDialog({
      open: false,
      product: null,
      newStockLevel: "",
      newReorderLevel: "",
    });
  };

  const handleEditDialogSave = async () => {
    const { product, newStockLevel, newReorderLevel } = editDialog;

    // Input validation
    if (
      newStockLevel === "" ||
      newReorderLevel === "" ||
      isNaN(newStockLevel) ||
      isNaN(newReorderLevel) ||
      Number(newStockLevel) < 0 ||
      Number(newReorderLevel) < 0
    ) {
      setSnackbar({
        open: true,
        message: "Please enter valid non-negative numbers for stock levels.",
        severity: "warning",
      });
      return;
    }

    try {
      const updateData = {
        stock_level: Number(newStockLevel),
        reorder_level: Number(newReorderLevel),
      };
      await updateInventory(product.product_id, updateData);
      setSnackbar({
        open: true,
        message: "Inventory updated successfully.",
        severity: "success",
      });
      handleEditDialogClose();
      loadInventory(); // Refresh inventory data
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' align='center' gutterBottom>
        Inventory Management
      </Typography>

      {/* Search and Refresh */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <TextField
          label='Search by Product ID or Name'
          variant='outlined'
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "60%" }}
        />
        <Tooltip title='Refresh'>
          <IconButton color='primary' onClick={loadInventory}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box display='flex' justifyContent='center' mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label='inventory table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Product ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Product Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Stock Level</strong>
                </TableCell>
                <TableCell>
                  <strong>Reorder Level</strong>
                </TableCell>
                <TableCell>
                  <strong>Supplier</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow
                    key={item.product_id}
                    sx={{
                      backgroundColor:
                        item.stock_level <= item.reorder_level
                          ? "rgba(255, 0, 0, 0.1)"
                          : "inherit",
                    }}
                  >
                    <TableCell>{item.product_id}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.stock_level}</TableCell>
                    <TableCell>{item.reorder_level}</TableCell>
                    <TableCell>{item.supplier_name}</TableCell>
                    <TableCell>
                      <Tooltip title='Edit Inventory'>
                        <IconButton
                          color='primary'
                          onClick={() => handleEditClick(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Inventory Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleEditDialogClose}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Edit Inventory</DialogTitle>
        <DialogContent>
          {editDialog.product && (
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
                <strong>Product ID:</strong> {editDialog.product.product_id}
              </Typography>
              <Typography>
                <strong>Product Name:</strong> {editDialog.product.product_name}
              </Typography>
              <TextField
                label='Stock Level'
                type='number'
                value={editDialog.newStockLevel}
                onChange={(e) =>
                  setEditDialog((prev) => ({
                    ...prev,
                    newStockLevel: e.target.value,
                  }))
                }
                inputProps={{ min: 0 }}
              />
              <TextField
                label='Reorder Level'
                type='number'
                value={editDialog.newReorderLevel}
                onChange={(e) =>
                  setEditDialog((prev) => ({
                    ...prev,
                    newReorderLevel: e.target.value,
                  }))
                }
                inputProps={{ min: 0 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleEditDialogSave}
            variant='contained'
            color='primary'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
