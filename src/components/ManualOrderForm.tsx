
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, CircularProgress, Alert, Autocomplete, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

interface ManualOrderFormProps {
  onClose: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onClose }) => {
  const { user, userProfile } = useAuth();
  const [tableNumber, setTableNumber] = useState('');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch restaurant menu on component mount
  useEffect(() => {
    const fetchMenu = async () => {
      if (!userProfile?.restaurantId) return;
      setLoading(true);
      try {
        const menuCollectionRef = collection(db, "restaurants", userProfile.restaurantId, "menu");
        const menuSnapshot = await getDocs(menuCollectionRef);
        const menuList = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
        setMenu(menuList);
      } catch (err) {
        setError("Menü yüklenirken bir hata oluştu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [userProfile?.restaurantId]);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart => prevCart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };


  const handleConfirmOrder = async () => {
    if (!tableNumber.trim()) {
      setError("Masa numarası zorunludur.");
      return;
    }
    if (cart.length === 0) {
      setError("Sepet boş olamaz.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const restaurantDoc = await getDoc(doc(db, "restaurants", userProfile?.restaurantId || ''));
      const restaurantName = restaurantDoc.exists() ? restaurantDoc.data().name : 'Bilinmeyen Restoran';
        
      const orderData = {
        restaurantId: userProfile?.restaurantId,
        restaurantName,
        items: cart,
        totalPrice: getTotalPrice(),
        tableNumber: tableNumber.trim(),
        orderTime: new Date().toISOString(),
        status: 'confirmed', // Manually added, so it's confirmed
        userId: user?.uid, // Can be the waiter's ID or null
        waiterConfirmedAt: serverTimestamp(),
        source: 'manual', // To distinguish from QR code orders
      };

      await addDoc(collection(db, "orders"), orderData);
      setSuccess(`Sipariş başarıyla oluşturuldu!`);
      setCart([]);
      setTableNumber('');
      setTimeout(onClose, 2000);
      
    } catch (err) {
      setError("Sipariş oluşturulurken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Manuel Sipariş</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        label="Masa Numarası"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        disabled={loading}
      />

      <Autocomplete
        options={menu}
        getOptionLabel={(option) => `${option.name} - ₺${option.price.toFixed(2)}`}
        onChange={(event, newValue) => {
          if (newValue) {
            addToCart(newValue);
          }
        }}
        renderInput={(params) => <TextField {...params} label="Menüden Ürün Ekle" />}
        disabled={loading || !userProfile?.restaurantId}
      />
      
      {cart.length > 0 && (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Sipariş Sepeti</Typography>
            <List>
                {cart.map(item => (
                    <ListItem key={item.id} secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => updateQuantity(item.id, 0)}>
                            <DeleteIcon />
                        </IconButton>
                    }>
                        <ListItemText primary={item.name} secondary={`Fiyat: ₺${item.price.toFixed(2)}`} />
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><RemoveIcon/></IconButton>
                            <Typography sx={{mx:1}}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><AddIcon/></IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>
            <Typography variant="h6" align="right">Toplam: ₺{getTotalPrice()}</Typography>
        </Box>
      )}


      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} color="secondary" disabled={loading}>İptal</Button>
        <Button
          onClick={handleConfirmOrder}
          variant="contained"
          disabled={loading || cart.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Siparişi Onayla'}
        </Button>
      </Box>
    </Box>
  );
};

export default ManualOrderForm;
