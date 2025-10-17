
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    CardActions, 
    Button, 
    Grid, 
    Box, 
    CircularProgress,
    Chip,
    CardMedia
} from '@mui/material';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
}

interface Restaurant {
    name: string;
    cuisine: string;
    imageUrl?: string;
}

const RestaurantMenuPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenuData = async () => {
            if (!restaurantId) return;
            setLoading(true);
            try {
                const restaurantRef = doc(db, 'restaurants', restaurantId);
                const restaurantSnap = await getDoc(restaurantRef);
                if (restaurantSnap.exists()) {
                    setRestaurant(restaurantSnap.data() as Restaurant);
                } else {
                    console.log("No such restaurant!");
                }

                const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
                const menuSnap = await getDocs(menuRef);
                const items = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
                setMenuItems(items);
            } catch (error) {
                console.error("Error fetching restaurant data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenuData();
    }, [restaurantId]);

    const handleAddToCart = (item: Omit<MenuItem, 'description' | 'category' | 'imageUrl'>) => {
        if (restaurantId && restaurant) {
            addToCart(item, { id: restaurantId, name: restaurant.name });
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (!restaurant) {
        return <Typography variant="h5" align="center" sx={{ mt: 5 }}>Restoran bulunamadı.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Card sx={{ mb: 4 }}>
                {restaurant.imageUrl && <CardMedia component="img" height="200" image={restaurant.imageUrl} alt={restaurant.name} />}
                <CardContent>
                    <Typography variant="h4" gutterBottom>{restaurant.name}</Typography>
                    <Chip label={restaurant.cuisine} color="primary" />
                </CardContent>
            </Card>
            
            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%' }}>
                            {item.imageUrl && <CardMedia component="img" height="140" image={item.imageUrl} alt={item.name} />}
                            <CardContent>
                                <Typography gutterBottom variant="h5">{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>₺{item.price.toFixed(2)}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" variant="contained" onClick={() => handleAddToCart(item)}>
                                    Sepete Ekle
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default RestaurantMenuPage;
