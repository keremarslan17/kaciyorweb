
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import theme from './theme';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RestaurantMenu from './pages/RestaurantMenu';
import AdminDashboard from './pages/Admin';
import BusinessOwnerDashboard from './pages/BusinessOwner';
import PhoneVerification from './pages/PhoneVerification';
import WaiterDashboard from './pages/WaiterDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <Navbar onCartOpen={() => setCartOpen(true)} />
            <Container sx={{ mt: 4, mb: 4 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
                <Route path="/phone-verification" element={<PhoneVerification />} />

                {/* RE-IMPLEMENTED: Protected Routes with Role-Based Access Control */}
                <Route 
                  path="/profile" 
                  element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin" 
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/business" 
                  element={<ProtectedRoute allowedRoles={['businessOwner', 'admin']}><BusinessOwnerDashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/waiter" 
                  element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><WaiterDashboard /></ProtectedRoute>} 
                />
              </Routes>
            </Container>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
