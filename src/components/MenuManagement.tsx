
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
    Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, 
    IconButton, Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, TextField, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
}

const MenuManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
    const [formState, setFormState] = useState({ name: '', description: '', price: '', category: '' });

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const menuQuery = collection(db, 'restaurants', restaurantId, 'menu');
        const unsubscribe = onSnapshot(menuQuery, (snap) => {
            setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

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

    const handleMenuSubmit = async () => {
        if (!restaurantId || !formState.name || !formState.price) return;
        
        const menuCollection = collection(db, 'restaurants', restaurantId, 'menu');
        const data = { 
            name: formState.name,
            description: formState.description,
            price: parseFloat(formState.price),
            category: formState.category
        };

        try {
            if (currentItem?.id) {
                await updateDoc(doc(menuCollection, currentItem.id), data);
            } else {
                await addDoc(menuCollection, data);
            }
        } catch (error) {
            console.error("Error saving menu item:", error);
        }
        
        handleClose();
    };

    const handleDeleteMenuItem = async (id: string) => {
        if (!restaurantId) return;
        if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
            try {
                await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', id));
            } catch (error) {
                console.error("Error deleting menu item:", error);
            }
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Menü Yönetimi</Typography>
                <Fab color="primary" size="small" onClick={() => handleOpen()}>
                    <AddIcon />
                </Fab>
            </Box>
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

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentItem?.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                <DialogContent>
                    <DialogContentText mb={2}>
                        Menünüze yeni bir ürün ekleyin veya mevcut bir ürünü güncelleyin.
                    </DialogContentText>
                    <TextField name="name" label="Ürün Adı" value={formState.name} onChange={handleFormChange} fullWidth margin="dense" required />
                    <TextField name="description" label="Açıklama" value={formState.description} onChange={handleFormChange} fullWidth margin="dense" />
                    <TextField name="price" label="Fiyat (₺)" type="number" value={formState.price} onChange={handleFormChange} fullWidth margin="dense" required/>
                    <TextField name="category" label="Kategori" value={formState.category} onChange={handleFormChange} fullWidth margin="dense" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleMenuSubmit} variant="contained">{currentItem?.id ? 'Güncelle' : 'Ekle'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManagement;
