
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, CircularProgress, TextField, Button, Paper, Alert } from '@mui/material';

interface RestaurantData {
    name: string;
    address: string;
    phone: string;
    cuisine: string;
}

const RestaurantEditor: React.FC = () => {
    const { userProfile } = useAuth();
    const [restaurant, setRestaurant] = useState<Partial<RestaurantData>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const docRef = doc(db, 'restaurants', restaurantId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setRestaurant(docSnap.data() as RestaurantData);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRestaurant(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!restaurantId) return;
        
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        
        try {
            const docRef = doc(db, 'restaurants', restaurantId);
            await updateDoc(docRef, restaurant);
            setSuccess("Restoran bilgileri başarıyla güncellendi.");
        } catch (err) {
            setError("Bilgiler güncellenirken bir hata oluştu.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" mb={3}>Restoran Bilgilerini Düzenle</Typography>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" noValidate autoComplete="off">
                <TextField
                    name="name"
                    label="Restoran Adı"
                    value={restaurant.name || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="address"
                    label="Adres"
                    value={restaurant.address || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="phone"
                    label="Telefon"
                    value={restaurant.phone || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="cuisine"
                    label="Mutfak Türü"
                    value={restaurant.cuisine || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <Button 
                    variant="contained" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    sx={{ mt: 2 }}
                >
                    {isSaving ? <CircularProgress size={24} /> : 'Kaydet'}
                </Button>
            </Box>
        </Paper>
    );
};

export default RestaurantEditor;
