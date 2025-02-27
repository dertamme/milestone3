import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Container,
} from "@mui/material";
import { fetchProducts } from "../services/productService";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);

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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Product Catalog
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.product_id}>
            <Card sx={{ maxWidth: 345, p: 2 }}>
              {/* If product.img_url is present, show <CardMedia> or <img>. */}
              {product.img_url && (
                <img
                  src={product.img_url}
                  alt={product.name}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              <CardContent>
                <Typography variant='h6'>{product.name}</Typography>
                <Typography variant='body2' color='textSecondary'>
                  {product.description}
                </Typography>
                <Typography variant='h6' sx={{ mt: 2 }}>
                  ${product.price}
                </Typography>
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
