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

const API_URL = "http://localhost:5000/api";

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Product Catalog
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.product_id}>
            <Card sx={{ maxWidth: 345, p: 2 }}>
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
