
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
    Chip
} from '@mui/material';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
}

interface Restaurant {
    name: string;
    cuisine: string;
}

const RestaurantMenuPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            if (!restaurantId) return;

            try {
                setLoading(true);
                const restaurantRef = doc(db, 'restaurants', restaurantId);
                const restaurantSnap = await getDoc(restaurantRef);
                if (restaurantSnap.exists()) {
                    setRestaurant(restaurantSnap.data() as Restaurant);
                }

                const menuRef = collection(db, 'restaurants', restaurantId, 'menu');
                const menuSnap = await getDocs(menuRef);
                const items = menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
                setMenuItems(items);

            } catch (error) {
                console.error("Error fetching restaurant menu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [restaurantId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!restaurant) {
        return (
            <Container>
                <Typography variant="h5" align="center" sx={{ mt: 5 }}>Restoran bulunamadı.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" gutterBottom>{restaurant.name}</Typography>
                <Chip label={restaurant.cuisine} color="primary" />
            </Box>
            
            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                    ₺{item.price.toFixed(2)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button 
                                    size="small" 
                                    variant="contained"
                                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                                >
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
