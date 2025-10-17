
import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Button, Typography, Box, IconButton, Paper } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (user) {
      // User is logged in, proceed to checkout
      console.log('Proceeding to checkout');
      onClose(); // Close the drawer
      // navigate('/checkout'); // Navigate to a checkout page if you have one
    } else {
      // User is not logged in, redirect to login page
      onClose(); // Close the drawer first
      navigate('/login');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Paper sx={{ width: 320, padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Sepetim</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {cartItems.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <ShoppingCartIcon color="disabled" sx={{ fontSize: 80 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>Sepetiniz boş.</Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {cartItems.map((item) => (
                <ListItem key={item.id} divider>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box>
                      <ListItemText primary={item.name} secondary={`₺${item.price.toFixed(2)}`} />
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Button variant="outlined" color="secondary" size="small" onClick={() => removeFromCart(item.id)}>Kaldır</Button>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="h6" align="right">Toplam: ₺{getTotalPrice()}</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCheckout}
              >
                Siparişi Tamamla
              </Button>
              <Button 
                variant="text" 
                fullWidth 
                sx={{ mt: 1 }} 
                onClick={clearCart}
              >
                Sepeti Temizle
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Drawer>
  );
};

export default CartDrawer;
