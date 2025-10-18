
import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, CircularProgress, Box } from '@mui/material';
import theme from './theme';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

// LAZY LOADING: Dynamically import pages for code-splitting
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const RestaurantMenu = React.lazy(() => import('./pages/RestaurantMenu'));
const AdminDashboard = React.lazy(() => import('./pages/Admin'));
const BusinessOwnerDashboard = React.lazy(() => import('./pages/BusinessOwner'));
const PhoneVerification = React.lazy(() => import('./pages/PhoneVerification'));
const WaiterDashboard = React.lazy(() => import('./pages/WaiterDashboard'));
// ADD: Lazy load the new UserAgreement page
const UserAgreement = React.lazy(() => import('./pages/UserAgreement'));


// Fallback component to show while pages are loading
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
    <CircularProgress />
  </Box>
);

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/restaurant/:restaurantId" element={<RestaurantMenu />} />
                  <Route path="/phone-verification" element={<PhoneVerification />} />
                  {/* ADD: Route for the UserAgreement page */}
                  <Route path="/user-agreement" element={<UserAgreement />} />

                  {/* Protected Routes */}
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
              </Suspense>
            </Container>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
