import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Grid,
  Container,
  TextField,
  Box,
} from "@mui/material";
import { fetchProducts } from "../services/productService";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      // Optionally show an error message or snackbar
    }
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

    const catName = prod.category_name ? prod.category_name.toLowerCase() : "";
    const matchesCategory =
      !categoryFilter || catName.includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesPrice && matchesCategory;
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Product Catalog
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          label='Search Products'
          variant='outlined'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          fullWidth
          label='Max Price'
          variant='outlined'
          type='number'
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        />
        <TextField
          fullWidth
          label='Category'
          variant='outlined'
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
      </Box>
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.product_id}>
            <Card
              sx={{
                maxWidth: 345,
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {product.img_url && (
                <CardMedia
                  component='img'
                  image={product.img_url}
                  alt={product.name}
                  sx={{
                    height: 200, // fixed height for consistent card sizes
                    objectFit: "cover", // ensures image covers the area
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant='h6'>{product.name}</Typography>
                <Typography variant='body2' color='textSecondary'>
                  {product.description}
                </Typography>
                <Typography variant='h6' sx={{ mt: 2 }}>
                  ${product.price}
                </Typography>
                {product.category_name && (
                  <Typography variant='body2' color='textSecondary'>
                    Category: {product.category_name}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size='small'
                  variant='contained'
                  component={Link}
                  to={`/product/${product.product_id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
