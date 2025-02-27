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
  Button,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { API_URL } from "../config";

export default function ProductManagement() {
  // State variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  // For searching & filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  // Now categoryFilter is a text-based filter
  const [categoryFilter, setCategoryFilter] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Dialog state for create/edit
  const [dialog, setDialog] = useState({
    open: false,
    mode: "create", // 'create' | 'edit'
    product: {
      product_id: null,
      name: "",
      description: "",
      price: "",
      // Keep category_id for storing, but we'll display category_name in the table
      category_id: "",
      img_url: "",
    },
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }
      const data = await response.json();
      setProducts(data);
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

  // Handle file selection for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Open the dialog for create/edit
  const handleOpenDialog = (mode, product = null) => {
    if (mode === "edit" && product) {
      setDialog({
        open: true,
        mode,
        product: {
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          category_id: product.category_id || "",
          img_url: product.img_url || "",
        },
      });
    } else {
      setDialog({
        open: true,
        mode,
        product: {
          product_id: null,
          name: "",
          description: "",
          price: "",
          category_id: "",
          img_url: "",
        },
      });
    }
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setDialog({
      open: false,
      mode: "create",
      product: {
        product_id: null,
        name: "",
        description: "",
        price: "",
        category_id: "",
        img_url: "",
      },
    });
    setImageFile(null);
  };

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDialog((prev) => ({
      ...prev,
      product: {
        ...prev.product,
        [name]: value,
      },
    }));
  };

  // Create or Update the product
  const handleSubmit = async () => {
    const { mode, product } = dialog;

    // Basic validation
    if (
      !product.name ||
      !product.description ||
      !product.price ||
      !product.category_id
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields.",
        severity: "warning",
      });
      return;
    }

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", parseFloat(product.price));
      formData.append("category_id", parseInt(product.category_id));

      // If user typed a direct URL
      if (product.img_url) {
        formData.append("img_url", product.img_url);
      }

      // If a file is selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (mode === "create") {
        response = await fetch(`${API_URL}/products`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/products/${product.product_id}`, {
          method: "PUT",
          body: formData,
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  // Delete product
  const handleDelete = async (product_id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${product_id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });
      fetchProducts();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  // Close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ========================
  // Search & Filter
  // ========================
  // We assume backend returns product.category_name
  // categoryFilter => user can type e.g. "Chairs"

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = !priceFilter || prod.price <= parseFloat(priceFilter);

    // For categoryFilter, we compare to product.category_name if available
    const catName = prod.category_name ? prod.category_name.toLowerCase() : "";
    const matchesCategory =
      !categoryFilter || catName.includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesPrice && matchesCategory;
  });

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' align='center' gutterBottom>
        Product Management
      </Typography>

      {/* Search and Filter Section */}
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 3 }}
      >
        <Box display='flex' gap={2}>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name or description...'
          />

          <TextField
            label='Filter by Price (max)'
            variant='outlined'
            size='small'
            type='number'
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          />

          {/* Now categoryFilter is a text for category name */}
          <TextField
            label='Filter by Category Name'
            variant='outlined'
            size='small'
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder='e.g. Chairs, Tables...'
          />
        </Box>

        <Button
          variant='contained'
          color='primary'
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
        >
          Add Product
        </Button>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box display='flex' justifyContent='center' mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label='products table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Image</strong>
                </TableCell>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Price ($)</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell align='center'>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.product_id}</TableCell>

                    {/* Show product image if available */}
                    <TableCell>
                      {product.img_url ? (
                        <img
                          src={product.img_url}
                          alt={product.name}
                          style={{ width: "60px", height: "auto" }}
                        />
                      ) : (
                        <Typography variant='body2' color='textSecondary'>
                          No image
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.price.toFixed(2)}</TableCell>

                    {/* Display category_name if provided by the backend */}
                    <TableCell>
                      {product.category_name || "Unknown Category"}
                    </TableCell>

                    <TableCell align='center'>
                      <Tooltip title='Edit'>
                        <IconButton
                          color='primary'
                          onClick={() => handleOpenDialog("edit", product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          color='error'
                          onClick={() => handleDelete(product.product_id)}
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
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Create/Edit Product */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>
          {dialog.mode === "create" ? "Add New Product" : "Edit Product"}
        </DialogTitle>
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
            <TextField
              label='Name'
              name='name'
              value={dialog.product.name}
              onChange={handleChange}
              required
            />
            <TextField
              label='Description'
              name='description'
              value={dialog.product.description}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
            <TextField
              label='Price'
              name='price'
              type='number'
              value={dialog.product.price}
              onChange={handleChange}
              required
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label='Category ID'
              name='category_id'
              type='number'
              value={dialog.product.category_id}
              onChange={handleChange}
              required
            />

            {/* user can optionally type direct image URL */}
            <TextField
              label='Image URL'
              name='img_url'
              value={dialog.product.img_url}
              onChange={handleChange}
            />

            {/* or user can select a file to upload */}
            <input type='file' accept='image/*' onChange={handleFileChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary'>
            {dialog.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

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
