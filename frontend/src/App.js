import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetails from "./components/ProductDetails";
import ShoppingCart from "./components/ShoppingCart";
import Checkout from "./components/Checkout";
import ProductManagement from "./components/ProductManagement";
import OrderManagement from "./components/OrderManagement";
import InventoryManagement from "./components/InventoryManagement";

export default function App() {
  return (
    <Router>
      <div>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6' sx={{ flexGrow: 1 }}>
              LowTech GmbH
            </Typography>
            <Button color='inherit' component={Link} to='/'>
              Home
            </Button>
            <Button color='inherit' component={Link} to='/cart'>
              Shopping Cart
            </Button>
            <Button color='inherit' component={Link} to='/products'>
              Product Management
            </Button>
            <Button color='inherit' component={Link} to='/orders'>
              Order Management
            </Button>
            <Button color='inherit' component={Link} to='/inventory'>
              Inventory Management
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path='/' element={<ProductCatalog />} />
            <Route path='/product/:id' element={<ProductDetails />} />
            <Route path='/cart' element={<ShoppingCart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/products' element={<ProductManagement />} />
            <Route path='/orders' element={<OrderManagement />} />
            <Route path='/inventory' element={<InventoryManagement />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}
