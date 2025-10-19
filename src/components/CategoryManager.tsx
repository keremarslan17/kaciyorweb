
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
    Box, Typography, Button, TextField, IconButton, List, ListItem, ListItemText,
    Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Category } from './MenuManagement'; // Assuming Category type is exported from MenuManagement

interface CategoryManagerProps {
    restaurantId: string | undefined;
    categories: Category[];
    onCategoryDeleted: (categoryId: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ restaurantId, categories, onCategoryDeleted }) => {
    const [open, setOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
    const [categoryName, setCategoryName] = useState('');

    const handleOpen = (category?: Category) => {
        if (category) {
            setCurrentCategory(category);
            setCategoryName(category.name);
        } else {
            setCurrentCategory(null);
            setCategoryName('');
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {
        if (!restaurantId || !categoryName.trim()) return;

        const categoryCollection = collection(db, 'restaurants', restaurantId, 'categories');
        
        try {
            if (currentCategory?.id) {
                await updateDoc(doc(categoryCollection, currentCategory.id), { name: categoryName });
            } else {
                await addDoc(categoryCollection, { name: categoryName });
            }
        } catch (error) {
            console.error("Error saving category:", error);
        }

        handleClose();
    };

    const handleDelete = async (category: Category) => {
        if (!restaurantId) return;
        if (window.confirm(`'${category.name}' kategorisini silmek istediğinizden emin misiniz? Bu kategorideki ürünler kategorisiz olarak işaretlenecektir.`)) {
            try {
                await deleteDoc(doc(db, 'restaurants', restaurantId, 'categories', category.id));
                onCategoryDeleted(category.id); // Callback to update items in the parent
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        }
    };

    return (
        <Box mb={4} p={2} border="1px solid #ddd" borderRadius={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Kategorileri Yönet</Typography>
                <Button variant="outlined" size="small" onClick={() => handleOpen()}>
                    Yeni Kategori Ekle
                </Button>
            </Box>
            <List dense>
                {categories.map(cat => (
                    <ListItem
                        key={cat.id}
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(cat)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(cat)} sx={{ ml: 1 }}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemText primary={cat.name} />
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentCategory?.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Kategori Adı"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleSubmit}>{currentCategory?.id ? 'Güncelle' : 'Ekle'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManager;
