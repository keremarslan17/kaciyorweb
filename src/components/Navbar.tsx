import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const { currentUser } = useAuth();
  const { cartItems } = useCart();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Kaçıyor
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentUser ? (
            <>
              {/* Rol bazlı butonlar eklenebilir */}
              <Button color="inherit" component={RouterLink} to="/profile">Profil</Button>
              <IconButton color="inherit" onClick={onCartClick}>
                <Badge badgeContent={totalItems} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </>
          ) : (
             <>
              <Button color="inherit" component={RouterLink} to="/login">Giriş Yap</Button>
              <Button color="inherit" component={RouterLink} to="/register">Kayıt Ol</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
