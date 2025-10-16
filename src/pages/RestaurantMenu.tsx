import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, CircularProgress, Box, Paper, List, ListItem, ListItemText, Divider, Chip, IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Interfaces
interface Restaurant { name: string; address: string; discount: string; }
interface Category { id: string; name: string; }
interface MenuItem { id: string; name: string; description: string; price: number; }
interface FullMenu extends Category { items: MenuItem[]; }

const RestaurantMenu: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { currentUser } = useAuth();
  const { addToCart, cartItems, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<FullMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!restaurantId) { setError("Restoran ID'si bulunamadı."); setLoading(false); return; }
      setLoading(true);
      try {
        const restDocRef = doc(db, 'restaurants', restaurantId);
        const restDocSnap = await getDoc(restDocRef);
        if (!restDocSnap.exists()) throw new Error("Restoran bulunamadı.");
        setRestaurant(restDocSnap.data() as Restaurant);
        const categoriesRef = collection(db, 'restaurants', restaurantId, 'categories');
        const categoriesSnapshot = await getDocs(query(categoriesRef, orderBy('name')));
        const categories = categoriesSnapshot.docs.map(catDoc => ({ id: catDoc.id, ...catDoc.data() } as Category));
        const fullMenuData: FullMenu[] = [];
        for (const category of categories) {
          const itemsRef = collection(db, 'restaurants', restaurantId, 'categories', category.id, 'menuItems');
          const itemsSnapshot = await getDocs(query(itemsRef, orderBy('name')));
          const items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() } as MenuItem));
          fullMenuData.push({ ...category, items });
        }
        setMenu(fullMenuData);
      } catch (err) { setError("Menü verileri yüklenemedi."); } 
      finally { setLoading(false); }
    };
    fetchMenuData();
  }, [restaurantId]);
  
  const handleAddToCart = async (item: MenuItem) => {
    if (!currentUser) { alert("Sepete eklemek için giriş yapmalısınız."); return; }
    if (!restaurantId) return;
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurantId) {
      if(window.confirm("Sepetinizde başka bir restorana ait ürünler var. Sepetinizi temizleyip bu ürünü eklemek ister misiniz?")) {
          await clearCart();
      } else { return; }
    }
    await addToCart({ menuItemId: item.id, name: item.name, price: item.price, restaurantId: restaurantId });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center">{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>{restaurant?.name}</Typography>
        <Typography variant="body1" color="textSecondary">{restaurant?.address}</Typography>
        <Chip label={restaurant?.discount} color="secondary" sx={{ mt: 2 }} />
      </Paper>
      {menu.map((category) => (
        <Box key={category.id} sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{category.name}</Typography>
          <List component={Paper}>
            {category.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem secondaryAction={<IconButton edge="end" onClick={() => handleAddToCart(item)}><AddShoppingCartIcon /></IconButton>}>
                  <ListItemText primary={item.name} secondary={item.description} />
                  <Typography variant="h6" component="p">{item.price.toFixed(2)} ₺</Typography>
                </ListItem>
                {index < category.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      ))}
    </Container>
  );
};

export default RestaurantMenu;
