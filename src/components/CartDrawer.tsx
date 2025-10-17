
import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Button, Typography, Box, IconButton, Paper, CircularProgress, Alert, Divider } from '@mui/material';
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
  const { cartItems, removeFromCart, updateQuantity, clearCart, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      setError("Sepetiniz boş.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await checkout();
      onClose();
      alert('Siparişiniz başarıyla alındı!');
    } catch (err) {
      setError('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Paper sx={{ width: 320, padding: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
          <Typography variant="h6">Sepetim</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {cartItems.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <ShoppingCartIcon color="disabled" sx={{ fontSize: 80 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>Sepetiniz şu an boş.</Typography>
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {cartItems.map((item) => (
                <ListItem key={item.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText primary={item.name} secondary={`Fiyat: ₺${item.price.toFixed(2)}`} sx={{ width: '100%', mb: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label=" azalt">
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ mx: 1.5 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="arttır">
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button variant="text" color="error" size="small" onClick={() => removeFromCart(item.id)}>Kaldır</Button>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee', flexShrink: 0 }}>
              <Typography variant="h6" align="right">Toplam: ₺{getTotalPrice()}</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Siparişi Tamamla'}
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
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
