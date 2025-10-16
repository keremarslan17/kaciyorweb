import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Drawer, Box, Typography, List, ListItem, ListItemText, IconButton, Button, Divider, CircularProgress, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cartItems, removeFromCart, addToCart, clearCart, loadingCart } = useCart();
  const { currentUser } = useAuth();
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = async () => {
    if (!currentUser || cartItems.length === 0) return;
    setOrderLoading(true);
    setOrderSuccess(false);
    const orderData = {
      userId: currentUser.uid,
      userName: currentUser.name || currentUser.email,
      restaurantId: cartItems[0].restaurantId,
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: totalPrice,
      status: 'yeni',
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'orders'), orderData);
      await clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        onClose();
        setOrderSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Sipariş oluşturulurken hata:", error);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Sepetim</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        {loadingCart ? <CircularProgress sx={{ alignSelf: 'center', mt: 4 }} /> : (
          cartItems.length === 0 ? (
            orderSuccess ? (
              <Alert severity="success" sx={{ mt: 4 }}>Siparişiniz başarıyla alındı!</Alert>
            ) : (
              <Typography sx={{ mt: 4, textAlign: 'center' }}>Sepetiniz boş.</Typography>
            )
          ) : (
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {cartItems.map(item => (
                <ListItem key={item.id}>
                  <ListItemText primary={item.name} secondary={`${item.quantity} x ${item.price.toFixed(2)} ₺`} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                        <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => addToCart({ ...item, quantity: 1 })}>
                        <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )
        )}
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <span>Toplam:</span> <span>{totalPrice.toFixed(2)} ₺</span>
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <Button variant="contained" fullWidth disabled={cartItems.length === 0 || orderLoading} onClick={handleCreateOrder}>
              Siparişi Tamamla
            </Button>
            {orderLoading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
