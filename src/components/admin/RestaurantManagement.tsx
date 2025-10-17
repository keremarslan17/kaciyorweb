
import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase';
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

const RestaurantManagement: React.FC = () => {
    const [rows, setRows] = useState<GridRowsProp>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [formState, setFormState] = useState({
        restaurantName: '', address: '', cuisine: '', latitude: '', longitude: '',
        ownerName: '', ownerEmail: '', ownerPassword: ''
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'restaurants'), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRows(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setError(null);
        setSuccess(null);
        setFormState({
             restaurantName: '', address: '', cuisine: '', latitude: '', longitude: '',
             ownerName: '', ownerEmail: '', ownerPassword: ''
        });
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateRestaurant = async () => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        try {
            const createFunction = httpsCallable(functions, 'createRestaurantAndOwner');
            // FIX: Use 'any' for the result data type for flexibility
            const result: HttpsCallableResult<any> = await createFunction(formState);
            if (result.data.success) {
                setSuccess('Restoran ve işletmeci başarıyla oluşturuldu!');
                handleClose();
            }
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Restoran Adı', width: 250 },
        { field: 'cuisine', headerName: 'Mutfak Türü', width: 150 },
        { field: 'address', headerName: 'Adres', flex: 1 },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tüm Restoranlar</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Yeni Ekle
                </Button>
            </Box>
            
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} loading={loading} />
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Restoran Oluştur</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Typography variant="subtitle1" gutterBottom>Restoran Bilgileri</Typography>
                    <TextField name="restaurantName" label="Restoran Adı" onChange={handleChange} fullWidth margin="dense" required />
                    <TextField name="address" label="Adres" onChange={handleChange} fullWidth margin="dense" required />
                    <TextField name="cuisine" label="Mutfak Türü" onChange={handleChange} fullWidth margin="dense" />
                    <TextField name="latitude" label="Enlem" type="number" onChange={handleChange} fullWidth margin="dense" required />
                    <TextField name="longitude" label="Boylam" type="number" onChange={handleChange} fullWidth margin="dense" required />
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>İşletmeci Bilgileri</Typography>
                    <TextField name="ownerName" label="İşletmeci Adı" onChange={handleChange} fullWidth margin="dense" required />
                    <TextField name="ownerEmail" label="İşletmeci E-posta" type="email" onChange={handleChange} fullWidth margin="dense" required />
                    <TextField name="ownerPassword" label="Şifre" type="password" onChange={handleChange} fullWidth margin="dense" required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isSubmitting}>İptal</Button>
                    <Button onClick={handleCreateRestaurant} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RestaurantManagement;
