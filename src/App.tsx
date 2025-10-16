import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import BusinessOwner from './pages/BusinessOwner';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import RestaurantMenu from './pages/RestaurantMenu';
import ProtectedRoute from './components/ProtectedRoute';
import PhoneVerification from './pages/PhoneVerification'; // Yeni sayfayı import et
import { Box, CssBaseline } from '@mui/material';
import CartDrawer from './components/CartDrawer';
import { useState } from 'react';

// Layout component to include the Navbar and CartDrawer
const MainLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);
  
  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar onCartClick={toggleCart} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        <Outlet />
      </Box>
      <CartDrawer open={cartOpen} onClose={toggleCart} />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Routes with Navbar */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
                <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantMenu /></ProtectedRoute>} />
              </Route>

              {/* Routes without Navbar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/phone-verification" element={<ProtectedRoute><PhoneVerification /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
              <Route path="/business" element={<ProtectedRoute requiredRole="business_owner"><BusinessOwner /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute requiredRole="business_owner"><CreatePost /></ProtectedRoute>} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
