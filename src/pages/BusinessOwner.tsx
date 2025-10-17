
import React, { useState, useEffect, useCallback } from 'react';
import { db, functions } from '../firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, Typography, Box, Paper, TextField, Button, CircularProgress, 
    Alert, List, ListItem, ListItemText, Divider, Grid, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces
interface Waiter { id: string; name: string; email: string; }
interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
}

// Main Component
const BusinessOwnerDashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState({ waiters: true, menu: true });
    
    // Dialog State
    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);

    // Form State
    const [formState, setFormState] = useState({ name: '', description: '', price: '', category: '' });
    
    // Waiter Form State
    const [newWaiterName, setNewWaiterName] = useState('');
    const [newWaiterUsername, setNewWaiterUsername] = useState('');
    const [newWaiterPassword, setNewWaiterPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const restaurantId = userProfile?.restaurantId;

    // Fetch Waiters and Menu Items
    useEffect(() => {
        if (!restaurantId) return;

        // Fetch Waiters
        const waitersQuery = query(collection(db, "users"), where("role", "==", "waiter"), where("restaurantId", "==", restaurantId));
        const unsubscribeWaiters = onSnapshot(waitersQuery, (snap) => {
            setWaiters(snap.docs.map(d => ({ id: d.id, ...d.data() } as Waiter)));
            setLoading(p => ({ ...p, waiters: false }));
        });

        // Fetch Menu
        const menuQuery = collection(db, 'restaurants', restaurantId, 'menu');
        const unsubscribeMenu = onSnapshot(menuQuery, (snap) => {
            setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
            setLoading(p => ({ ...p, menu: false }));
        });

        return () => {
            unsubscribeWaiters();
            unsubscribeMenu();
        };
    }, [restaurantId]);

    // --- DIALOG HANDLERS ---
    const handleOpen = (item?: MenuItem) => {
        if (item) {
            setCurrentItem(item);
            setFormState({ name: item.name, description: item.description, price: String(item.price), category: item.category });
        } else {
            setCurrentItem(null);
            setFormState({ name: '', description: '', price: '', category: '' });
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    // --- CRUD OPERATIONS ---
    const handleMenuSubmit = async () => {
        if (!restaurantId) return;
        const menuCollection = collection(db, 'restaurants', restaurantId, 'menu');
        const data = { ...formState, price: parseFloat(formState.price) };

        if (currentItem?.id) { // Update
            await updateDoc(doc(menuCollection, currentItem.id), data);
        } else { // Create
            await addDoc(menuCollection, data);
        }
        handleClose();
    };

    const handleDeleteMenuItem = async (id: string) => {
        if (!restaurantId) return;
        if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
            await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', id));
        }
    };
    
    // --- WAITER OPERATIONS ---
    // (Existing handleAddWaiter function)

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>İşletmeci Paneli</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Restoran: {userProfile?.restaurantName || userProfile?.name || 'Yükleniyor...'}
                </Typography>

                {/* --- Menu Management --- */}
                <Box mb={5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">Menü Yönetimi</Typography>
                        <Fab color="primary" size="small" onClick={() => handleOpen()}>
                            <AddIcon />
                        </Fab>
                    </Box>
                    {loading.menu ? <CircularProgress /> : (
                        <List>
                            {menuItems.map(item => (
                                <ListItem key={item.id} secondaryAction={
                                    <Box>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(item)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMenuItem(item.id)} sx={{ ml: 1 }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                }>
                                    <ListItemText primary={item.name} secondary={`₺${item.price} - ${item.category}`} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
                
                <Divider sx={{ my: 5 }} />

                {/* --- Waiter Management --- */}
                {/* (Existing Waiter Management JSX) */}

            </Paper>

            {/* --- Add/Edit Menu Item Dialog --- */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentItem?.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                <DialogContent>
                    <DialogContentText mb={2}>
                        Menünüze yeni bir ürün ekleyin veya mevcut bir ürünü güncelleyin.
                    </DialogContentText>
                    <TextField name="name" label="Ürün Adı" value={formState.name} onChange={handleFormChange} fullWidth margin="dense" />
                    <TextField name="description" label="Açıklama" value={formState.description} onChange={handleFormChange} fullWidth margin="dense" />
                    <TextField name="price" label="Fiyat (₺)" type="number" value={formState.price} onChange={handleFormChange} fullWidth margin="dense" />
                    <TextField name="category" label="Kategori" value={formState.category} onChange={handleFormChange} fullWidth margin="dense" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleMenuSubmit} variant="contained">{currentItem?.id ? 'Güncelle' : 'Ekle'}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default BusinessOwnerDashboard;
