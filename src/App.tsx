
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import theme from './theme';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Corrected the import path
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RestaurantMenu from './pages/RestaurantMenu';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Admin from './pages/Admin';
import BusinessOwnerDashboard from './pages/BusinessOwner';
import PhoneVerification from './pages/PhoneVerification';


function App() {
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartClose = () => {
    setCartOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Container sx={{ mt: 4 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
                <Route path="/post/:postId" element={<PostDetail />} />
                <Route path="/phone-verification" element={<PhoneVerification />} />


                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                
                {/* Admin and Business Routes - Add specific role checks if needed */}
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/business" element={<ProtectedRoute><BusinessOwnerDashboard /></ProtectedRoute>} />

              </Routes>
            </Container>
            <CartDrawer open={cartOpen} onClose={handleCartClose} />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
