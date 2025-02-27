import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetails from "./components/ProductDetails";
import ShoppingCart from "./components/ShoppingCart";
import Checkout from "./components/Checkout";
import ProductManagement from "./components/ProductManagement";
import OrderManagement from "./components/OrderManagement";
import InventoryManagement from "./components/InventoryManagement";

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Home", link: "/" },
    { text: "Shopping Cart", link: "/cart" },
    { text: "Product Management", link: "/products" },
    { text: "Order Management", link: "/orders" },
    { text: "Inventory Management", link: "/inventory" },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant='h6' sx={{ my: 2 }}>
        LowTech GmbH
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.link}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Router>
      <div>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6' sx={{ flexGrow: 1 }}>
              LowTech GmbH
            </Typography>
            {/* Desktop Menu */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color='inherit'
                  component={Link}
                  to={item.link}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            {/* Mobile Menu Icon */}
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='end'
              onClick={handleDrawerToggle}
              sx={{ display: { xs: "block", sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {/* Mobile Drawer */}
        <Drawer
          anchor='right'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Improves performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
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
