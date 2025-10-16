import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, addDoc, doc, query, onSnapshot, where, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button, List, ListItem,
  ListItemText, IconButton, CircularProgress, Divider, Tabs, Tab, Select, MenuItem, FormControl, ListItemButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// Data Interfaces
interface Category { id: string; name: string; }
interface MenuItemData { name: string; description: string; price: number; }
interface MenuItem extends MenuItemData { id: string; }
interface Order {
  id: string; userName: string; totalPrice: number; status: 'yeni' | 'hazırlanıyor' | 'yolda' | 'tamamlandı' | 'iptal';
  createdAt: any; items: any[];
}

const BusinessOwner: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const restaurantId = currentUser?.restaurantId;

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingCategories(true);
    const q = query(collection(db, 'restaurants', restaurantId, 'categories'));
    const snapshot = await getDocs(q);
    setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    setLoadingCategories(false);
  }, [restaurantId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!restaurantId) return;
    setLoadingOrders(true);
    const q = query(collection(db, 'orders'), where("restaurantId", "==", restaurantId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoadingOrders(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const fetchMenuItems = async (categoryId: string) => {
    if (!restaurantId) return;
    setLoadingMenuItems(true);
    const q = query(collection(db, 'restaurants', restaurantId, 'categories', categoryId, 'menuItems'));
    const snapshot = await getDocs(q);
    setMenuItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
    setLoadingMenuItems(false);
  };
  
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    fetchMenuItems(category.id);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !newCategoryName.trim()) return;
    await addDoc(collection(db, 'restaurants', restaurantId, 'categories'), { name: newCategoryName });
    setNewCategoryName('');
    await fetchCategories();
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !selectedCategory) return;
    await addDoc(collection(db, 'restaurants', restaurantId, 'categories', selectedCategory.id, 'menuItems'), { 
      name: newItem.name, description: newItem.description, price: parseFloat(newItem.price) 
    });
    setNewItem({ name: '', description: '', price: '' });
    await fetchMenuItems(selectedCategory.id);
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!restaurantId || !selectedCategory) return;
    await deleteDoc(doc(db, 'restaurants', restaurantId, 'categories', selectedCategory.id, 'menuItems', itemId));
    await fetchMenuItems(selectedCategory.id);
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
      if(!orderId) return;
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
  };

  if (!restaurantId) return <Container><Typography>Restoran atanmamış.</Typography></Container>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>İşletmeci Paneli</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="Siparişler" />
          <Tab label="Menü Yönetimi" />
        </Tabs>
      </Box>
      {activeTab === 0 && <Paper sx={{p: 2}}>{loadingOrders ? <CircularProgress/> : <List>{orders.map(o => ( <ListItem key={o.id} divider><ListItemText primary={`${o.userName} - ${o.totalPrice.toFixed(2)} ₺`} secondary={new Date(o.createdAt?.toDate()).toLocaleString()} /><FormControl size="small" sx={{width: 150}}><Select value={o.status} onChange={(e) => handleOrderStatusChange(o.id, e.target.value as Order['status'])}><MenuItem value="yeni">Yeni</MenuItem><MenuItem value="hazırlanıyor">Hazırlanıyor</MenuItem><MenuItem value="yolda">Yolda</MenuItem><MenuItem value="tamamlandı">Tamamlandı</MenuItem><MenuItem value="iptal">İptal</MenuItem></Select></FormControl></ListItem>))}</List>}</Paper>}
      {activeTab === 1 && (
         <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Kategoriler</Typography>
                <Box component="form" onSubmit={handleAddCategory} sx={{ mt: 2, mb: 2 }}><TextField label="Yeni Kategori" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} fullWidth size="small"/><Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Ekle</Button></Box>
                <Divider />
                {loadingCategories ? <CircularProgress /> : <List component="nav">{categories.map(cat => ( 
                  <ListItemButton key={cat.id} selected={selectedCategory?.id === cat.id} onClick={() => handleSelectCategory(cat)}>
                    <ListItemText primary={cat.name} />
                  </ListItemButton>
                ))}</List>}
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{selectedCategory ? `${selectedCategory.name} - Ürünler` : "Kategori seçin"}</Typography>
                {selectedCategory && (
                  <>
                    <Box component="form" onSubmit={handleAddMenuItem} sx={{ mt: 2, mb: 2 }}><TextField label="Ürün Adı" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} fullWidth size="small"/><TextField label="Açıklama" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} fullWidth size="small"/><TextField label="Fiyat (₺)" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} fullWidth size="small"/><Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Ekle</Button></Box>
                    <Divider />
                    {loadingMenuItems ? <CircularProgress /> : <List>{menuItems.map(item => (<ListItem key={item.id} secondaryAction={<IconButton edge="end" onClick={() => handleDeleteMenuItem(item.id)}><DeleteIcon /></IconButton>}><ListItemText primary={item.name} secondary={`${item.description} - ${item.price} ₺`} /></ListItem>))}</List>}
                  </>
                )}
              </Paper>
            </Grid>
         </Grid>
      )}
    </Container>
  );
};

export default BusinessOwner;
