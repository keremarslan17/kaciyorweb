
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface NavbarProps {
  onCartOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const { user, userProfile, logout } = useAuth();
  const { cartState } = useCart();
  const cartItemCount = cartState.items.reduce((count, item) => count + item.quantity, 0);

  const renderOwnerNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={logout}>
        Çıkış Yap
      </Button>
    </Box>
  );

  const renderWaiterNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={logout}>
        Çıkış Yap
      </Button>
    </Box>
  );

  const renderUserNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton color="inherit" component={Link} to="/">
        <HomeIcon />
      </IconButton>
      <IconButton color="inherit" component={Link} to="/profile">
        <AccountCircleIcon />
      </IconButton>
      <IconButton color="inherit" onClick={onCartOpen}>
        <Badge badgeContent={cartItemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
      <Button color="inherit" startIcon={<ExitToAppIcon />} onClick={logout}>
        Çıkış Yap
      </Button>
    </Box>
  );

  const renderGuestNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
       <IconButton color="inherit" component={Link} to="/">
        <HomeIcon />
      </IconButton>
      <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
        Giriş Yap
      </Button>
      <Button color="inherit" component={Link} to="/register" startIcon={<AppRegistrationIcon />}>
        Kayıt Ol
      </Button>
    </Box>
  );

  const getNavForRole = () => {
    if (!user || !userProfile) return renderGuestNav();
    switch (userProfile.role) {
      case 'businessOwner':
        return renderOwnerNav();
      case 'waiter':
        return renderWaiterNav();
      case 'user':
      default:
        return renderUserNav();
    }
  }

  const getLogoLink = () => {
     if (!user || !userProfile) return '/';
     switch (userProfile.role) {
       case 'businessOwner':
         return '/business';
       case 'waiter':
         return '/waiter';
       default:
         return '/';
     }
  }

  return (
    <AppBar position="static" sx={{ borderRadius: 2, margin: 'auto', mt: 2, maxWidth: '95%' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={getLogoLink()} style={{ textDecoration: 'none', color: 'inherit' }}>
            Kaçıyor
          </Link>
        </Typography>
        {getNavForRole()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
