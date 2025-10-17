
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
    Box, Typography, CircularProgress, List, ListItem, ListItemText, 
    TextField, Button, Switch, FormControlLabel, Paper, Grid,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';

interface MenuItemData {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
}

const DiscountManager: React.FC = () => {
    const { userProfile } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
    
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
    const [discountValue, setDiscountValue] = useState<number>(0);

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const menuQuery = query(collection(db, 'restaurants', restaurantId, 'menu'));
        const unsubscribe = onSnapshot(menuQuery, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItemData));
            setMenuItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

    const handleApplyDiscount = async () => {
        if (!restaurantId || !selectedItem) return;

        const newPrice = discountType === 'percent'
            ? selectedItem.price * (1 - discountValue / 100)
            : selectedItem.price - discountValue;

        const finalPrice = Math.max(0, newPrice); 

        try {
            const itemRef = doc(db, 'restaurants', restaurantId, 'menu', selectedItem.id);
            await updateDoc(itemRef, {
                discountPrice: finalPrice
            });
            // Update local state for immediate feedback
            setMenuItems(prev => prev.map(item => item.id === selectedItem.id ? {...item, discountPrice: finalPrice} : item));
            setSelectedItem(null);
            setDiscountValue(0);

        } catch (error) {
            console.error("Error applying discount:", error);
        }
    };
    
    const handleRemoveDiscount = async (itemId: string) => {
        if (!restaurantId) return;
        try {
            const itemRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
            await updateDoc(itemRef, {
                discountPrice: null // Or delete the field
            });
            setMenuItems(prev => prev.map(item => item.id === itemId ? {...item, discountPrice: undefined} : item));
        } catch (error) {
            console.error("Error removing discount:", error);
        }
    };


    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h5" mb={3}>İndirim Yönetimi</Typography>
            <Grid container spacing={4}>
                {/* Item Selection */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>Ürün Seç</Typography>
                        <List>
                            {menuItems.map(item => (
                                <ListItem 
                                    key={item.id} 
                                    button 
                                    selected={selectedItem?.id === item.id}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <ListItemText 
                                        primary={item.name} 
                                        secondary={
                                            item.discountPrice != null 
                                                ? `₺${item.discountPrice.toFixed(2)} (Normal: ₺${item.price})` 
                                                : `₺${item.price}`
                                        } 
                                    />
                                     {item.discountPrice != null && (
                                        <Button size="small" color="secondary" onClick={() => handleRemoveDiscount(item.id)}>
                                            İndirimi Kaldır
                                        </Button>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Discount Application */}
                <Grid item xs={12} md={7}>
                    {selectedItem && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>İndirim Uygula: {selectedItem.name}</Typography>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>İndirim Türü</InputLabel>
                                <Select
                                    value={discountType}
                                    label="İndirim Türü"
                                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                                >
                                    <MenuItem value="percent">Yüzde (%)</MenuItem>
                                    <MenuItem value="amount">Tutar (₺)</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Değer"
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                                fullWidth
                                margin="normal"
                            />
                            <Button onClick={handleApplyDiscount} variant="contained" sx={{ mt: 2 }}>
                                İndirimi Uygula
                            </Button>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default DiscountManager;
