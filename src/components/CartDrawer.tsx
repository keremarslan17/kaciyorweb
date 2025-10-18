
import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Button, Typography, Box, IconButton, Paper, CircularProgress, Alert, Divider, Chip, TextField, Modal } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { QRCodeCanvas } from 'qrcode.react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cartState, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [isQrModalOpen, setQrModalOpen] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (cartState.items.length === 0) {
      setError("Sepetiniz boş.");
      return;
    }
    if (!tableNumber.trim()) {
      setError("Lütfen masa numarasını girin.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const orderDetails = {
        restaurantId: cartState.restaurantId,
        restaurantName: cartState.restaurantName,
        items: cartState.items,
        totalPrice: getTotalPrice(),
        tableNumber: tableNumber.trim(),
        orderTime: new Date().toISOString(),
        status: 'pending',
        userId: user.uid,
      };

      setQrCodeValue(JSON.stringify(orderDetails));
      setQrModalOpen(true);
      // The actual checkout logic will be moved to the waiter's confirmation step.
      // For now, we just generate the QR code.
      
    } catch (err) {
      setError('QR kod oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setQrModalOpen(false);
    setQrCodeValue('');
    clearCart();
    onClose();
  };
  
  const getTotalPrice = () => {
    return cartState.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Paper sx={{ width: 320, padding: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
            <Typography variant="h6">Sepetim</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {cartState.restaurantName && (
            <Chip label={`Restoran: ${cartState.restaurantName}`} size="small" sx={{ mb: 2 }} />
          )}
          <Divider sx={{ mb: 2 }} />
          
          {cartState.items.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <ShoppingCartIcon color="disabled" sx={{ fontSize: 80 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>Sepetiniz şu an boş.</Typography>
            </Box>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>{error}</Alert>}
              <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                {cartState.items.map((item) => (
                  <ListItem key={item.id} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText primary={item.name} secondary={`Fiyat: ₺${item.price.toFixed(2)}`} sx={{ width: '100%', mb: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="azalt">
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
                <TextField
                  label="Masa Numarası"
                  variant="outlined"
                  fullWidth
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" align="right">Toplam: ₺{getTotalPrice()}</Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }} 
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sepeti Onayla ve QR Oluştur'}
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
      <Modal
        open={isQrModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="order-qr-code-modal-title"
        aria-describedby="order-qr-code-modal-description"
      >
        <Box sx={style}>
          <Typography id="order-qr-code-modal-title" variant="h6" component="h2">
            Siparişiniz Alındı!
          </Typography>
          <Typography id="order-qr-code-modal-description" sx={{ mt: 2, mb: 3 }}>
            Lütfen bu QR kodu garsona okutarak siparişinizi onaylatın.
          </Typography>
          {qrCodeValue && <QRCodeCanvas value={qrCodeValue} size={256} />}
          <Button onClick={handleCloseModal} sx={{ mt: 3 }} variant="contained">Kapat</Button>
        </Box>
      </Modal>
    </>
  );
};

export default CartDrawer;
