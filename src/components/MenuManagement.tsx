
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import {
    Box, Typography, Button, CircularProgress, List, ListItem, ListItemText,
    IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Fab,
    Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, InputLabel, FormControl, Chip,
    ImageList, ImageListItem, ImageListItemBar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryManager from './CategoryManager'; // We'll create this component

interface MenuItemData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    imagePath?: string;
    allergens?: string;
}

interface MenuItem extends MenuItemData {
    id: string;
}

export interface Category {
    id: string;

    name: string;
}

const MenuManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
    const [formState, setFormState] = useState<MenuItemData>({ name: '', description: '', price: 0, category: '', allergens: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const restaurantId = userProfile?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const menuQuery = collection(db, 'restaurants', restaurantId, 'menu');
        const categoryQuery = collection(db, 'restaurants', restaurantId, 'categories');

        const unsubscribeMenu = onSnapshot(menuQuery, (snap) => {
            setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
            setLoading(false);
        });

        const unsubscribeCategories = onSnapshot(categoryQuery, (snap) => {
            setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
        });

        return () => {
            unsubscribeMenu();
            unsubscribeCategories();
        };
    }, [restaurantId]);

    const handleOpen = (item?: MenuItem) => {
        if (item) {
            setCurrentItem(item);
            setFormState({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                imageUrl: item.imageUrl,
                imagePath: item.imagePath,
                allergens: item.allergens || ''
            });
        } else {
            setCurrentItem(null);
            setFormState({ name: '', description: '', price: 0, category: '', allergens: '' });
        }
        setImageFile(null);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name as string]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleMenuSubmit = async () => {
        if (!restaurantId || !formState.name || formState.price <= 0 || !formState.category) {
            alert("Lütfen gerekli tüm alanları doldurun.");
            return;
        }
        
        setIsUploading(true);
        const menuCollection = collection(db, 'restaurants', restaurantId, 'menu');
        let data: MenuItemData = { ...formState, price: Number(formState.price) };

        try {
            // Handle Image Upload
            if (imageFile) {
                // If editing and there's an old image, delete it first
                if (currentItem?.imagePath) {
                    const oldImageRef = ref(storage, currentItem.imagePath);
                    await deleteObject(oldImageRef).catch(err => console.error("Could not delete old image:", err));
                }
                const imagePath = `restaurants/${restaurantId}/menu/${Date.now()}_${imageFile.name}`;
                const imageRef = ref(storage, imagePath);
                await uploadBytes(imageRef, imageFile);
                const imageUrl = await getDownloadURL(imageRef);
                data.imageUrl = imageUrl;
                data.imagePath = imagePath;
            }

            if (currentItem?.id) {
                await updateDoc(doc(menuCollection, currentItem.id), data as any);
            } else {
                await addDoc(menuCollection, data);
            }
        } catch (error) {
            console.error("Error saving menu item:", error);
            alert("Ürün kaydedilirken bir hata oluştu.");
        }
        
        setIsUploading(false);
        handleClose();
    };

    const handleDeleteMenuItem = async (item: MenuItem) => {
        if (!restaurantId) return;
        if (window.confirm(`'${item.name}' ürününü silmek istediğinizden emin misiniz?`)) {
            try {
                // Delete image from storage if it exists
                if (item.imagePath) {
                    const imageRef = ref(storage, item.imagePath);
                    await deleteObject(imageRef);
                }
                await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', item.id));
            } catch (error) {
                console.error("Error deleting menu item:", error);
                alert("Ürün silinirken bir hata oluştu.");
            }
        }
    };

    const onCategoryDeleted = async (categoryId: string) => {
        if (!restaurantId) return;
        
        const batch = writeBatch(db);
        const itemsToUpdate = menuItems.filter(item => item.category === categoryId);

        itemsToUpdate.forEach(item => {
            const itemRef = doc(db, 'restaurants', restaurantId, 'menu', item.id);
            batch.update(itemRef, { category: '' }); // or a default category
        });

        await batch.commit();
    };


    if (loading) {
        return <CircularProgress />;
    }

    const groupedMenu = categories.map(category => ({
        ...category,
        items: menuItems.filter(item => item.category === category.id)
    }));
    const uncategorizedItems = menuItems.filter(item => !item.category || !categories.some(c => c.id === item.category));


    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Menü Yönetimi</Typography>
                <Fab color="primary" size="small" onClick={() => handleOpen()}>
                    <AddIcon />
                </Fab>
            </Box>

            <CategoryManager restaurantId={restaurantId} categories={categories} onCategoryDeleted={onCategoryDeleted} />

            {groupedMenu.map(group => (
                group.items.length > 0 && (
                    <Accordion key={group.id} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{group.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ImageList cols={3} gap={16}>
                                {group.items.map(item => (
                                    <ImageListItem key={item.id} sx={{ '& .MuiImageListItem-img': { borderRadius: 2, boxShadow: 3 } }}>
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            alt={item.name}
                                            loading="lazy"
                                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                                        />
                                        <ImageListItemBar
                                            title={item.name}
                                            subtitle={`₺${item.price}`}
                                            actionIcon={
                                                <Box>
                                                    <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }} onClick={() => handleOpen(item)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }} onClick={() => handleDeleteMenuItem(item)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        />
                                        {item.allergens && <Chip label={`Alerjenler: ${item.allergens}`} size="small" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }} />}
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </AccordionDetails>
                    </Accordion>
                )
            ))}
             {uncategorizedItems.length > 0 && (
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Kategorisiz</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                         <List>
                            {uncategorizedItems.map(item => (
                                 <ListItem key={item.id} secondaryAction={
                                     <Box>
                                         <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(item)}>
                                             <EditIcon />
                                         </IconButton>
                                         <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMenuItem(item)} sx={{ ml: 1 }}>
                                             <DeleteIcon />
                                         </IconButton>
                                     </Box>
                                 }>
                                     <ListItemText primary={item.name} secondary={`₺${item.price}`} />
                                 </ListItem>
                            ))}
                         </List>
                    </AccordionDetails>
                </Accordion>
            )}


            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentItem?.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                <DialogContent>
                    <TextField name="name" label="Ürün Adı" value={formState.name} onChange={handleFormChange} fullWidth margin="dense" required />
                    <TextField name="description" label="Açıklama" value={formState.description} onChange={handleFormChange} fullWidth margin="dense" multiline rows={3} />
                    <TextField name="price" label="Fiyat (₺)" type="number" value={formState.price} onChange={handleFormChange} fullWidth margin="dense" required/>
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Kategori</InputLabel>
                        <Select name="category" value={formState.category} label="Kategori" onChange={handleFormChange as any}>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField name="allergens" label="Alerjen Bilgileri (virgülle ayırın)" value={formState.allergens} onChange={handleFormChange} fullWidth margin="dense" />
                    <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                        Fotoğraf Yükle
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>
                    {imageFile && <Typography variant="body2" mt={1}>{imageFile.name}</Typography>}
                    {currentItem?.imageUrl && !imageFile && <img src={currentItem.imageUrl} alt="Mevcut fotoğraf" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}/>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleMenuSubmit} variant="contained" disabled={isUploading}>
                        {isUploading ? <CircularProgress size={24} /> : (currentItem?.id ? 'Güncelle' : 'Ekle')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManagement;
