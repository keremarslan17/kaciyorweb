import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, addDoc, doc, query, onSnapshot, where, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Typography, Paper, Box, Grid, TextField, Button, List, ListItem,
  ListItemText, IconButton, CircularProgress, Divider, Tabs, Tab, Select, MenuItem, FormControl, ListItemButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// ... (Interfaces remain the same)
interface Category { id: string; name: string; }
interface MenuItem extends Category { description: string; price: number; }
interface Order { id: string; userName: string; totalPrice: number; status: string; createdAt: any; }

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

  // Data fetching and handlers...
  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return; setLoadingCategories(true);
    const q = query(collection(db, 'restaurants', restaurantId, 'categories'));
    const snapshot = await getDocs(q);
    setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    setLoadingCategories(false);
  }, [restaurantId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!restaurantId) return; setLoadingOrders(true);
    const q = query(collection(db, 'orders'), where("restaurantId", "==", restaurantId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoadingOrders(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const fetchMenuItems = async (categoryId: string) => { /* ... */ };
  const handleSelectCategory = (category: Category) => { /* ... */ };
  const handleAddCategory = async (e: React.FormEvent) => { /* ... */ };
  const handleAddMenuItem = async (e: React.FormEvent) => { /* ... */ };
  const handleDeleteMenuItem = async (itemId: string) => { /* ... */ };
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => { /* ... */ };

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
      {activeTab === 0 && (
        <Paper sx={{p: 2}}>{/* ... Orders UI ... */}</Paper>
      )}
      {activeTab === 1 && (
         <Grid container spacing={4}>
            <Grid xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                {/* ... Categories UI ... */}
              </Paper>
            </Grid>
            <Grid xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                {/* ... Menu Items UI ... */}
              </Paper>
            </Grid>
         </Grid>
      )}
    </Container>
  );
};

export default BusinessOwner;
