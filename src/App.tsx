import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import BusinessOwner from "./pages/BusinessOwner";
import RestaurantMenu from "./pages/RestaurantMenu";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CartDrawer from './components/CartDrawer'; // Sepet çekmecesini import et

// MUI
import { Container } from "@mui/material";

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartClick = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  return (
    <>
      <Navbar onCartClick={handleCartClick} />
      <CartDrawer open={cartOpen} onClose={handleCartClose} />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* ... (Tüm rotalarınız aynı kalıyor) ... */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="/business" element={<ProtectedRoute allowedRoles={['işletmeci']}><BusinessOwner /></ProtectedRoute>} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
