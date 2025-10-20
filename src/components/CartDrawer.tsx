
import React, { useState, useEffect } from 'react';
import { 
    Drawer, List, ListItem, ListItemText, Button, Typography, Box, IconButton, 
    Paper, CircularProgress, Alert, Divider, TextField, Modal, Avatar, ListItemAvatar 
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { QRCodeCanvas } from 'qrcode.react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
};

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cartState, removeFromCart, updateQuantity, createOrder, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState('pending_confirmation');
  
  // This effect listens to order status changes using the orderId from the QR code value
  useEffect(() => {
    if (!qrCodeValue) return;

    let orderId = '';
    try {
        orderId = JSON.parse(qrCodeValue).orderId;
    } catch(e) {
        console.error("Failed to parse QR code JSON:", e);
        return;
    }

    const unsub = onSnapshot(doc(db, "orders", orderId), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setOrderStatus(data.status);
            if (data.status === 'confirmed') {
                setTimeout(() => { handleCloseModal(); }, 3000); // Close modal 3s after confirmation
            }
        }
    });
    return () => unsub();
  }, [qrCodeValue]);

  const handleCreateOrder = async () => {
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
        const generatedQrData = await createOrder(tableNumber.trim());
        if (generatedQrData) {
            setQrCodeValue(generatedQrData);
            setOrderStatus('pending_confirmation'); // Reset status for new order
            setQrModalOpen(true);
        } else {
            setError('Sipariş oluşturulamadı.');
        }
    } catch (err: any) {
      setError(`Sipariş hatası: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setQrModalOpen(false);
    setQrCodeValue(null);
    onClose(); 
  };
  
  const total = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderModalContent = () => {
    switch (orderStatus) {
      case 'confirmed':
        return (
          <Box>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="success.main">Sipariş Onaylandı!</Typography>
            <Typography sx={{ mt: 2 }}>Garsonumuz siparişinizi hazırlıyor. Afiyet olsun!</Typography>
          </Box>
        );
      case 'pending_confirmation':
      default:
        return (
          <Box>
            <HourglassEmptyIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5">Garson Onayı Bekleniyor</Typography>
            <Typography sx={{ mt: 2 }}>Lütfen QR kodu garsona gösterin.</Typography>
            {qrCodeValue && <QRCodeCanvas value={qrCodeValue} size={256} style={{ marginTop: '20px' }} />}
          </Box>
        );
    }
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Paper elevation={0} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <Typography variant="h6" component="div">
            Sepetiniz ({cartState.restaurantName || ''})
          </Typography>
          <IconButton onClick={onClose} aria-label="close cart">
            <CloseIcon />
          </IconButton>
        </Paper>
        <Divider />

        {cartState.items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ShoppingCartIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography>Sepetiniz şu an boş.</Typography>
          </Box>
        ) : (
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {cartState.items.map(item => (
              <ListItem key={item.id}>
                <ListItemAvatar>
                  <Avatar variant="rounded" src={item.imageUrl || undefined} />
                </ListItemAvatar>
                <ListItemText 
                  primary={item.name} 
                  secondary={`₺${item.price.toFixed(2)}`} 
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                  <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {cartState.items.length > 0 && (
            <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee', flexShrink: 0, backgroundColor: 'background.paper' }}>
              <TextField
                label="Masa Numarası"
                variant="outlined"
                fullWidth
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <Typography variant="h6" align="right">Toplam: ₺{total.toFixed(2)}</Typography>
              {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCreateOrder}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Siparişi Onayla & QR Oluştur'}
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                color="error"
                sx={{ mt: 1 }} 
                onClick={clearCart}
              >
                Sepeti Temizle
              </Button>
            </Box>
        )}
      </Drawer>
      
      <Modal
        open={isQrModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="qr-code-modal-title"
      >
        <Box sx={modalStyle}>
          {renderModalContent()}
        </Box>
      </Modal>
    </>
  );
};

export default CartDrawer;
