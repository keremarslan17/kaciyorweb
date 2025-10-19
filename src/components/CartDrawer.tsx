
import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, Button, Typography, Box, IconButton, Paper, CircularProgress, Alert, Divider, Chip, TextField, Modal, FormControlLabel, Checkbox } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { QRCodeCanvas } from 'qrcode.react';
import { collection, addDoc, onSnapshot, doc, DocumentData, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

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
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [userBalance, setUserBalance] = useState(0);
  const [useBalance, setUseBalance] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user && cartState.restaurantId) {
        const balanceRef = doc(db, 'userBalances', `${user.uid}_${cartState.restaurantId}`);
        const balanceSnap = await getDoc(balanceRef);
        if (balanceSnap.exists()) {
          setUserBalance(balanceSnap.data().balance);
        } else {
          setUserBalance(0);
        }
      }
    };
    if (open) {
      fetchBalance();
    }
  }, [user, cartState.restaurantId, open]);

  useEffect(() => {
    if (!pendingOrderId) return;
    const unsub = onSnapshot(doc(db, "pendingOrders", pendingOrderId), (doc) => {
        if (doc.exists()) {
            const data = doc.data() as DocumentData;
            setOrderStatus(data.status);
            if (data.status === 'confirmed') {
                setTimeout(() => { handleCloseModal(); }, 3000);
            }
        }
    });
    return () => unsub();
  }, [pendingOrderId]);

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
    
    const originalTotal = cartState.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const balanceToUse = useBalance ? Math.min(originalTotal, userBalance) : 0;
    const finalTotal = originalTotal - balanceToUse;

    try {
        const pendingOrderRef = await addDoc(collection(db, "pendingOrders"), {
            restaurantId: cartState.restaurantId,
            restaurantName: cartState.restaurantName,
            items: cartState.items,
            totalPrice: originalTotal, // The price before balance is applied
            balanceUsed: balanceToUse, // The amount of balance used
            finalPrice: finalTotal, // The price after balance is applied
            tableNumber: tableNumber.trim(),
            orderTime: new Date().toISOString(),
            status: 'pending',
            userId: user.uid,
        });

        const orderDetailsForQR = {
            pendingOrderId: pendingOrderRef.id,
            restaurantName: cartState.restaurantName,
            items: cartState.items,
            totalPrice: finalTotal,
            tableNumber: tableNumber.trim(),
        };
        
        setPendingOrderId(pendingOrderRef.id);
        setQrCodeValue(JSON.stringify(orderDetailsForQR));
        setQrModalOpen(true);
        setOrderStatus('pending');

    } catch (err) {
      setError('Sipariş oluşturulurken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setQrModalOpen(false);
    setQrCodeValue('');
    setPendingOrderId(null);
    clearCart();
    onClose();
    setUseBalance(false); // Reset balance usage on close
  };
  
  const calculateTotals = () => {
      const originalTotal = cartState.items.reduce((total, item) => total + item.price * item.quantity, 0);
      const balanceToUse = useBalance ? Math.min(originalTotal, userBalance) : 0;
      const finalTotal = originalTotal - balanceToUse;
      return { originalTotal, balanceToUse, finalTotal };
  };

  const { finalTotal } = calculateTotals();

  const renderModalContent = () => {
    // ... (same as before)
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        {/* ... (same as before) ... */}
        {cartState.items.length > 0 && (
            <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee', flexShrink: 0 }}>
              <TextField
                label="Masa Numarası"
                variant="outlined"
                fullWidth
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                sx={{ mb: 2 }}
              />
              {userBalance > 0 && (
                <FormControlLabel
                  control={<Checkbox checked={useBalance} onChange={(e) => setUseBalance(e.target.checked)} />}
                  label={`Kullanılabilir Bakiye: ${userBalance.toFixed(2)} TL`}
                />
              )}
              <Typography variant="h6" align="right">Toplam: ₺{finalTotal.toFixed(2)}</Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sepeti Onayla ve QR Oluştur'}
              </Button>
              {/* ... (rest is the same) ... */}
            </Box>
        )}
      </Drawer>
      {/* ... (modal is the same) ... */}
    </>
  );
};

export default CartDrawer;
